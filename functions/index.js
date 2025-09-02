// 1. HttpsError를 v2/https에서 직접 임포트합니다.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
const db = admin.firestore();
const storage = admin.storage();

const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;

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

exports.kakaoLogin = onCall({ secrets: ["KAKAO_REST_API_KEY"] }, async (request) => {
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

exports.deleteClub = onCall(async (request) => {
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
    });
    
    // (선택사항) 클럽 하위의 members 문서들 자체도 삭제
    membersSnapshot.forEach((memberDoc) => {
      batch.delete(memberDoc.ref);
    });

    // 4. 메인 'clubs' 컬렉션에서 클럽 문서 삭제
    batch.delete(clubRef);

    // 5. Batch 작업 실행
    await batch.commit();

    // 6. 스토리지에서 클럽 대표 이미지 삭제
    if (clubData.profileUrl) {
      try {
        // URL에서 파일 경로를 추출해야 합니다.
        // 예: https://firebasestorage.googleapis.com/v0/b/your-project.appspot.com/o/club_profiles%2Fimage.jpg?alt=media
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
