import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
// import { getAuth, signInWithCustomToken } from 'firebase/auth';
import { signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../api/firebaseConfig';

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processLogin = async () => {
      // 1. URL에서 인가 코드(code)를 추출합니다.
      const code = new URLSearchParams(location.search).get('code');

      if (!code) {
        console.error("인가 코드가 없습니다.");
        navigate('/login'); // 실패 시 로그인 페이지로
        return;
      }

      try {
        // 2. 인가 코드를 Cloud Function으로 보냅니다.
        const functions = getFunctions();
        const kakaoLoginCallable = httpsCallable(functions, 'kakaoLogin');
        const result = await kakaoLoginCallable({ code: code }); // access_token 대신 code를 보냄

        // 4. 응답으로 받은 Firebase 커스텀 토큰으로 로그인합니다.
        const { token: firebaseToken } = result.data;
        // const auth = getAuth();
        await signInWithCustomToken(auth, firebaseToken);

        navigate('/'); // 성공 시 메인 페이지로

      } catch (error) {
        console.error("Firebase 커스텀 로그인 실패", error);
        navigate('/login');
      }
    };

    processLogin();
  }, [location, navigate]);

  return (
    <div>
      <p>카카오 로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default KakaoCallback;