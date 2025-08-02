import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { loginWithCustomToken } from '../api/authService';

const KakaoCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const processKakaoLogin = async (code) => {
      try {
        // 1. 배포한 Cloud Function을 'kakaoLogin'이라는 이름으로 참조
        const functions = getFunctions();
        const kakaoLoginCallable = httpsCallable(functions, 'kakaoLogin');

        // 2. Cloud Function에 인가 코드를 보내고 커스텀 토큰을 받음
        const result = await kakaoLoginCallable({ code: code });
        const { customToken } = result.data;

        // 3. 받은 커스텀 토큰으로 Firebase에 로그인
        if (customToken) {
          await loginWithCustomToken(customToken);
          navigate('/'); // 로그인 성공 후 메인 페이지로 이동
        } else {
          throw new Error('커스텀 토큰을 받지 못했습니다.');
        }

      } catch (error) {
        console.error('카카오 로그인 처리 실패:', error);
        navigate('/login'); // 실패 시 로그인 페이지로 이동
      }
    };

    // URL에서 인가 코드 추출
    const code = new URLSearchParams(location.search).get('code');
    if (code) {
      processKakaoLogin(code);
    } else {
      console.error('카카오 인가 코드가 없습니다.');
      navigate('/login'); // 코드가 없으면 로그인 페이지로 리디렉션
    }
  }, [location, navigate]);

  return (
    <div>
      <p>카카오 로그인 처리 중입니다. 잠시만 기다려주세요...</p>
    </div>
  );
};

export default KakaoCallback;