// functions/index.js

const functions = require("firebase-functions/v2");
const {onCall} = require("firebase-functions/v2/https");
const {defineSecret} = require("firebase-functions/v2/params");
const admin = require("firebase-admin");
const axios = require("axios");

admin.initializeApp();

const KAKAO_REST_API_KEY = defineSecret("KAKAO_REST_API_KEY");

// 1. 인가 코드를 받아 카카오 토큰(access_token)을 요청하는 함수
const getKakaoToken = async (code, apiKey, redirectUri) => {
  const tokenResponse = await axios.post(
      "https://kauth.kakao.com/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          client_id: apiKey,
          redirect_uri: redirectUri,
          code: code,
        },
      },
  );
  return tokenResponse.data;
};

// 2. 카카오 토큰으로 사용자 정보를 요청하는 함수
const getKakaoUserInfo = async (accessToken) => {
  const userResponse = await axios.get("https://kapi.kakao.com/v2/user/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return userResponse.data;
};

// 3. 메인 Cloud Function (HTTP 요청으로 트리거)
exports.kakaoLogin= onCall({secrets: [KAKAO_REST_API_KEY]}, async (request) => {
  const code = request.data.code;
  if (!code) {
    throw new functions.https.HttpsError(
        "invalid-argument",
        "Authorization code is required.",
    );
  }

  try {
    // process.env에서 환경 변수를 가져옴
    const apiKey = KAKAO_REST_API_KEY.value();
    const redirectUri = process.env.KAKAO_REDIRECT_URI;

    const kakaoTokenData = await getKakaoToken(code, apiKey, redirectUri);

    const kakaoUserInfo = await getKakaoUserInfo(kakaoTokenData.access_token);
    const uid = `kakao:${kakaoUserInfo.id}`; // Firebase에 저장될 고유 UID

    // Firebase Auth 사용자 업데이트 또는 생성
    try {
      await admin.auth().updateUser(uid, {
        displayName: kakaoUserInfo.properties.nickname,
        photoURL: kakaoUserInfo.properties.profile_image,
        email: kakaoUserInfo.kakao_account.email, // 사용자가 동의한 경우에만 존재
      });
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        await admin.auth().createUser({
          uid: uid,
          displayName: kakaoUserInfo.properties.nickname,
          photoURL: kakaoUserInfo.properties.profile_image,
          email: kakaoUserInfo.kakao_account.email,
        });
      } else {
        throw error;
      }
    }

    // Firebase Custom Token 생성
    const customToken = await admin.auth().createCustomToken(uid);

    // 클라이언트에 Custom Token 반환
    return {customToken};
  } catch (error) {
    console.error("Kakao login failed:", error);
    throw new functions.https.HttpsError(
        "internal",
        "Failed to process Kakao login.",
    );
  }
});
