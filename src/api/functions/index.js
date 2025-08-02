// functions/index.js

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const axios = require("axios");

// ⚠️ 중요: Firebase 서비스 계정 키를 설정해야 합니다.
// Firebase 콘솔 > 프로젝트 설정 > 서비스 계정 > '새 비공개 키 생성'으로 json 파일을 받아
// Cloud Functions 환경 변수에 저장하는 것을 권장합니다.
// firebase functions:config:set kakao.service_account="$(cat your-service-account-file.json)"
admin.initializeApp();

const KAKAO_REST_API_KEY = functions.config().kakao.rest_api_key; // 환경변수에서 키 가져오기
const KAKAO_REDIRECT_URI = functions.config().kakao.redirect_uri; // 환경변수에서 URI 가져오기

// 1. 인가 코드를 받아 카카오 토큰(access_token)을 요청하는 함수
const getKakaoToken = async (code) => {
  const tokenResponse = await axios.post(
    "https://kauth.kakao.com/oauth/token",
    null,
    {
      params: {
        grant_type: "authorization_code",
        client_id: KAKAO_REST_API_KEY,
        redirect_uri: KAKAO_REDIRECT_URI,
        code: code,
      },
    }
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
exports.kakaoLogin = functions.https.onCall(async (data, context) => {
  const code = data.code;
  if (!code) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Authorization code is required."
    );
  }

  try {
    // 카카오 토큰 및 사용자 정보 가져오기
    const kakaoTokenData = await getKakaoToken(code);
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
    return { customToken };

  } catch (error) {
    console.error("Kakao login failed:", error);
    throw new functions.https.HttpsError(
      "internal",
      "Failed to process Kakao login."
    );
  }
});