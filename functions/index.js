// 1. HttpsError를 v2/https에서 직접 임포트합니다.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const admin = require("firebase-admin");
const axios = require("axios");

// admin.initializeApp();
// const db = admin.firestore();
// const storage = admin.storage();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
// const HOLIDAY_API_KEY = process.env.HOLIDAY_API_KEY;

const getKakaoAccessToken = async (code) => {
  const response = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    new URLSearchParams({
      grant_type: "authorization_code",
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code: code,
    }).toString(),
    {
      headers: {
        "Content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
    }
  );
  return response.data.access_token;
};

exports.kakaoLogin = onCall({ region: "asia-northeast3", secrets: ["KAKAO_REST_API_KEY"] }, async (request) => {
  if (admin.apps.length === 0) { // 앱이 초기화되지 않았을 때만 실행
    admin.initializeApp();
  }
  const db = admin.firestore(); // 함수 내에서 필요할 때 선언

  try {
    const { code } = request.data;
    if (!code) {
      // 2. new HttpsError(...) 로 직접 사용합니다.
      throw new HttpsError('invalid-argument', 'Authorization code is required.');
    }

    const apiKey = KAKAO_REST_API_KEY;
    const redirectUri = KAKAO_REDIRECT_URI;

    if (!apiKey || !redirectUri) {
      console.error("환경 변수가 설정되지 않았습니다.");
      throw new HttpsError('internal', 'Server configuration error.');
    }

    const accessToken = await getKakaoAccessToken(code, apiKey, redirectUri);

    const kakaoRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const kakaoData = kakaoRes.data;
    const kakaoUid = `kakao:${kakaoData.id}`;
    console.log(kakaoData);
    // ✅ 아래와 같이 ?. 와 || 를 사용해 안전하게 값을 가져오도록 수정합니다.
    const displayName = kakaoData.properties?.nickname || '카카오사용자';
    const photoURL = kakaoData.properties?.profile_image;
    const email = kakaoData.kakao_account?.email;

    try {
      await admin.auth().updateUser(kakaoUid, { displayName, photoURL, email });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({ uid: kakaoUid, displayName, photoURL, email });
      } else {
        throw error;
      }
    }

    const customToken = await admin.auth().createCustomToken(kakaoUid);
    return { token: customToken };

  } catch (err) {
    console.error("Authentication Error:", err.response ? err.response.data : err.message);
    
    // 3. catch 블록에서도 HttpsError를 직접 사용합니다.
    if (err instanceof HttpsError) {
      throw err; // 이미 HttpsError인 경우 그대로 던집니다.
    }
    throw new HttpsError('internal', 'Kakao authentication failed.');
  }
});

exports.deleteClub = onCall({ region: "asia-northeast3" }, async (request) => {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  const db = admin.firestore();
  const storage = admin.storage();

  // 1. 사용자 인증 확인
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "인증된 사용자만 클럽을 삭제할 수 있습니다.");
  }
  const callerUid = request.auth.uid;
  const { clubId } = request.data;

  if (!clubId) {
    throw new HttpsError("invalid-argument", "clubId가 필요합니다.");
  }

  const clubRef = db.doc(`clubs/${clubId}`);

  try {
    const clubDoc = await clubRef.get();
    if (!clubDoc.exists) {
      throw new HttpsError("not-found", "삭제하려는 클럽을 찾을 수 없습니다.");
    }

    const clubData = clubDoc.data();

    // 2. 클럽 소유자(owner)만 삭제 가능하도록 권한 확인
    if (clubData.owner !== callerUid) {
      throw new HttpsError("permission-denied", "클럽장만 클럽을 삭제할 수 있습니다.");
    }

    const batch = db.batch();

    // 3. 모든 멤버의 'myClubs'에서 해당 클럽 정보 삭제
    const membersSnapshot = await clubRef.collection("members").get();
    membersSnapshot.forEach((memberDoc) => {
      const memberUid = memberDoc.id;
      const myClubRef = db.doc(`users/${memberUid}/myClubs/${clubId}`);
      batch.delete(myClubRef);
      batch.delete(memberDoc.ref);  // members 문서 자체도 삭제
    });
    
    // 4. 클럽의 모든 게시글(posts) 및 그 하위의 댓글(comments), 관련 스토리지 이미지 삭제
    const postsSnapshot = await clubRef.collection("posts").get();
    if (!postsSnapshot.empty) {
      for (const postDoc of postsSnapshot.docs) {
        // 각 게시글의 'comments' 하위 컬렉션 삭제
        const commentsSnapshot = await postDoc.ref.collection("comments").get();
        if (!commentsSnapshot.empty) {
          commentsSnapshot.forEach((commentDoc) => {
            batch.delete(commentDoc.ref);
          });
        }
        // 게시글 이미지 삭제
        const postData = postDoc.data();
        if (postData.imageUrl) {
          try {
            const decodedUrl = decodeURIComponent(postData.imageUrl);
            const pathStartIndex = decodedUrl.indexOf("/o/") + 3;
            const pathEndIndex = decodedUrl.indexOf("?alt=media");
            const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
            await storage.bucket().file(filePath).delete();
          } catch (storageError) {
            console.error(`게시글 이미지 삭제 실패 (Post ID: ${postDoc.id}):`, storageError);
          }
        }
        // 게시글 문서 삭제
        batch.delete(postDoc.ref);
      }
    }

    // 5. 메인 'clubs' 컬렉션에서 클럽 문서 삭제
    batch.delete(clubRef);

    // 6. Batch 작업 실행
    await batch.commit();

    // 7. 스토리지에서 클럽 대표 이미지 삭제
    if (clubData.profileUrl) {
      try {
        const decodedUrl = decodeURIComponent(clubData.profileUrl);
        const pathStartIndex = decodedUrl.indexOf("/o/") + 3;
        const pathEndIndex = decodedUrl.indexOf("?alt=media");
        const filePath = decodedUrl.substring(pathStartIndex, pathEndIndex);
        
        await storage.bucket().file(filePath).delete();
      } catch (storageError) {
        console.error("스토리지 이미지 삭제 실패:", storageError);
        // 이미지가 없어도 나머지 로직은 성공했으므로 에러를 던지지는 않습니다.
      }
    }

    return { success: true, message: "클럽이 성공적으로 삭제되었습니다." };

  } catch (error) {
    console.error("클럽 삭제 함수 오류:", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "클럽 삭제 중 오류가 발생했습니다.");
  }
});

exports.updateMyClubsOnClubChange = onDocumentUpdated({
    document: "clubs/{clubId}",
    region: "asia-northeast3",
  }, async (event) => {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  const db = admin.firestore();

  // 1. 변경 전/후 데이터 가져오기
  const beforeData = event.data.before.data();
  const afterData = event.data.after.data();
  const { clubId } = event.params;

  // 2. 클럽 이름, 지역, 프로필 URL 중 하나라도 변경되었는지 확인
  if (
    beforeData.name === afterData.name &&
    beforeData.region === afterData.region &&
    beforeData.profileUrl === afterData.profileUrl
  ) {
    console.log(`클럽 [${clubId}]의 주요 정보 변경 없음. 업데이트를 건너뜁니다.`);
    return null; // 변경 없으면 함수 종료
  }

  console.log(`클럽 [${clubId}] 정보 변경 감지. 멤버들의 myClubs 업데이트 시작.`);

  // 3. 업데이트할 필드만 담은 객체 생성
  const updatedFields = {
    clubName: afterData.name,
    region: afterData.region,
    clubProfileUrl: afterData.profileUrl,
  };

  // 4. 이 클럽에 속한 모든 멤버의 정보를 가져옵니다.
  const membersSnapshot = await db
    .collection(`clubs/${clubId}/members`)
    .get();

  if (membersSnapshot.empty) {
    console.log(`클럽 [${clubId}]에 멤버가 없어 업데이트를 종료합니다.`);
    return null;
  }

  // 5. Batch Write를 사용해 모든 멤버의 myClubs 문서를 원자적으로 업데이트
  const batch = db.batch();
  membersSnapshot.forEach((memberDoc) => {
    const memberUid = memberDoc.id;
    const myClubRef = db.doc(`users/${memberUid}/myClubs/${clubId}`);
    batch.update(myClubRef, updatedFields);
  });

  try {
    await batch.commit();
    console.log(
      `클럽 [${clubId}]의 ${membersSnapshot.size}명 멤버 정보 업데이트 성공.`
    );
    return { success: true };
  } catch (error) {
    console.error(
      `클럽 [${clubId}] 멤버 정보 업데이트 중 오류 발생:`,
      error
    );
    return { success: false, error: error.message };
  }
});

// 매월 3일 오전 5시에 함수를 실행
exports.updateHolidays = onSchedule({
  schedule: "0 5 3 * *", // 매월 3일 오전 5시
  timeZone: "Asia/Seoul",
  region: "asia-northeast3", 
  secrets: ["HOLIDAY_API_KEY"], 
}, async (event) => {
  if (admin.apps.length === 0) {
    admin.initializeApp();
  }
  const db = admin.firestore();

  const serviceKey = process.env.HOLIDAY_API_KEY; // secrets에서 키를 가져옵니다.
  const currentYear = new Date().getFullYear();
  const yearsToFetch = [currentYear, currentYear + 1];

  for (const year of yearsToFetch) {
    console.log(`Fetching holidays for ${year}...`);
    try {
      const allHolidays = [];
      for (let month = 1; month <= 12; month++) {
          const formattedMonth = month.toString().padStart(2, '0');
          const response = await axios.get("https://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService/getRestDeInfo", {
            params: {
              solYear: year,
              solMonth: formattedMonth,
              ServiceKey: serviceKey,
              _type: "json",
            },
          });
          const items = response.data?.response?.body?.items?.item || [];
          const holidaysOfMonth = Array.isArray(items) ? items : [items];
          holidaysOfMonth.forEach(item => {
            allHolidays.push({
              date: `${item.locdate.toString().slice(0, 4)}-${item.locdate.toString().slice(4, 6)}-${item.locdate.toString().slice(6, 8)}`,
              name: item.dateName,
            });
          });
      }
      const docRef = db.collection("holidays").doc(String(year));
      await docRef.set({ items: allHolidays });
      console.log(`${year}년도 공휴일 갱신에 성공했습니다.`);
    } catch (error) {
      console.error(`${year}년도 공휴일 갱신에 실패했습니다:`, error.message);
    }
  }
  return null;
});