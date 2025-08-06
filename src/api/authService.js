/*
 *  Firebase Authentication
 */
import { GoogleAuthProvider, signInWithPopup, signInWithCustomToken, signOut } from 'firebase/auth';
import { auth } from './firebaseConfig';

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({    // 계정 선택 강제
    prompt: 'select_account',
  });
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

/**
 * Kakao Login
 * Firebase에서 Kakao를 직접 지원하지 않으므로 Custom Token 방식으로 인증합니다.
 * 1. 카카오 인가 코드 받기 (Redirect)
 * 2. 받은 인가 코드로 백엔드(Cloud Function)에 Firebase Custom Token 요청
 * 3. 받은 Custom Token으로 Firebase에 로그인
 */
export const loginWithKakao = () => {
  // 1. 카카오 인가 코드 받기 (Redirect)
  const KAKAO_REST_API_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY; // ⚠️ 환경 변수에서 키를 가져오세요.
  const KAKAO_REDIRECT_URI = process.env.REACT_APP_KAKAO_REDIRECT_URI; // ⚠️ 환경 변수에서 리다이렉트 URI를 가져오세요.
  
  const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
  
  window.location.href = kakaoURL;
};

// 백엔드(Cloud Function)로부터 받은 custom token으로 Firebase에 로그인하는 함수
export const loginWithCustomToken = async (customToken) => {
  try {
    const result = await signInWithCustomToken(auth, customToken);
    return result.user;
  } catch (error) {
    console.error('Firebase 커스텀 토큰 로그인 실패:', error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);

    // 카카오 로그인 상태도 함께 로그아웃
    // window.Kakao.Auth.getAccessToken() 으로 카카오 로그인 여부를 확인합니다.
    if (window.Kakao && window.Kakao.Auth.getAccessToken()) {
      window.Kakao.Auth.logout(() => {
        console.log('Kakao logout 성공');
      });
    }
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};