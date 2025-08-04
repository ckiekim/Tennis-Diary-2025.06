const { onCall } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/v2/params");
const admin = require("firebase-admin");
const axios = require("axios");

// kakao.rest_api_key 와 kakao.redirect_uri를 Firebase 환경 변수로 설정해야 합니다.
// firebase functions:config:set kakao.rest_api_key="YOUR_KEY"
// firebase functions:config:set kakao.redirect_uri="YOUR_URI"

admin.initializeApp();

// 2. Secret Manager에 저장된 키를 참조하도록 정의
const KAKAO_REST_API_KEY = defineSecret("KAKAO_REST_API_KEY");

// 인가 코드를 Access Token으로 교환하는 함수
const getKakaoAccessToken = async (code, apiKey, redirectUri) => { // 3. 파라미터로 받도록 수정
  const response = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    new URLSearchParams({ // 4. URLSearchParams를 사용해 x-www-form-urlencoded 형식으로 전송
      grant_type: "authorization_code",
      client_id: apiKey,
      redirect_uri: redirectUri,
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

// 5. secrets 옵션을 추가하고, 환경 변수를 올바르게 전달
exports.kakaoLogin = onCall({ secrets: [KAKAO_REST_API_KEY] }, async (request) => {
  try {
    const { code } = request.data;
    if (!code) {
      throw new functions.https.HttpsError('invalid-argument', 'Authorization code is required.');
    }

    // Secret Manager와 .env에서 값을 가져옵니다.
    const apiKey = KAKAO_REST_API_KEY.value();
    const redirectUri = process.env.KAKAO_REDIRECT_URI; // .env 파일에서 읽어옴

    const accessToken = await getKakaoAccessToken(code, apiKey, redirectUri);

    const kakaoRes = await axios.get("https://kapi.kakao.com/v2/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const kakaoData = kakaoRes.data;
    const kakaoUid = `kakao:${kakaoData.id}`;
    
    // (여기에 사용자 생성/업데이트 로직 추가)
    try {
      await admin.auth().updateUser(kakaoUid, {
        displayName: kakaoData.properties.nickname,
        photoURL: kakaoData.properties.profile_image,
        email: kakaoData.kakao_account.email,
      });
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        await admin.auth().createUser({
          uid: kakaoUid,
          displayName: kakaoData.properties.nickname,
          photoURL: kakaoData.properties.profile_image,
          email: kakaoData.kakao_account.email,
        });
      } else {
        throw error;
      }
    }

    const customToken = await admin.auth().createCustomToken(kakaoUid);
    return { token: customToken };

  } catch (err) {
    console.error("Authentication Error:", err.response ? err.response.data : err);
    throw new functions.https.HttpsError(
      'internal',
      'Kakao authentication failed.'
    );
  }
});