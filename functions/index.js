// 1. HttpsError를 v2/https에서 직접 임포트합니다.
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();
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
