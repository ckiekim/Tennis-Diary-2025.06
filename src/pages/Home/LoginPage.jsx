import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, Typography } from '@mui/material';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../api/firebaseConfig';
import { FaComment } from 'react-icons/fa';

export default function LoginPage() {
  const navigate = useNavigate();

  // Google 로그인 성공 시 호출될 콜백 함수
  const handleGoogleCredentialResponse = async (response) => {
    // console.log("Encoded JWT ID token: " + response.credential);
    
    // Google에서 받은 ID 토큰으로 Firebase credential 생성
    const credential = GoogleAuthProvider.credential(response.credential);

    try {
      // 생성된 credential로 Firebase에 최종 로그인
      const result = await signInWithCredential(auth, credential);
      console.log('Firebase에 성공적으로 로그인:', result.user);
      navigate('/');
    } catch (error) {
      console.error('Firebase credential 로그인 실패:', error);
      alert('로그인에 실패했습니다.');
    }
  };

  useEffect(() => {
    // Google 로그인 버튼 초기화 및 렌더링
    window.google.accounts.id.initialize({
      client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      callback: handleGoogleCredentialResponse
    });

    window.google.accounts.id.renderButton(
      document.getElementById("googleSignInButton"), // 버튼이 렌더링될 div
      { type: "standard", theme: "outline", size: "large", text: "signin_with",
        shape: "rectangular", logo_alignment: "left", width: "220", }  // 버튼 디자인 옵션
    );
  });

  const handleKakaoLogin = () => {
    if (!window.Kakao) {
      alert("카카오 SDK를 불러오지 못했습니다.");
      return;
    }

    window.Kakao.Auth.authorize({
      redirectUri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
    });
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 10, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 4, }}
    >
      <img src="/logo512.png" alt="Logo" style={{ maxWidth: '300px', margin: '0 auto' }} />
      <Typography variant="h5" sx={{marginTop: '60px'}}>로그인이 필요합니다</Typography>
      <Box 
        sx={{ 
          display: 'flex',  flexDirection: { xs: 'column', sm: 'row' }, // 모바일에서는 세로, 데스크탑에서는 가로 정렬
          justifyContent: 'center',  alignItems: 'center', gap: 2, height: '50px',
        }}
      >
        <div id="googleSignInButton"></div>
        <Button
          variant="contained"
          startIcon={<FaComment />}
          sx={{
            backgroundColor: '#FEE500', // 카카오톡 공식 색상
            color: '#000000',
            '&:hover': {
              backgroundColor: '#FEE500', // hover 시에도 색상 유지
            },
          }}
          onClick={handleKakaoLogin}
        >
          카카오 로그인
        </Button>
      </Box>
    </Container>
  );
}