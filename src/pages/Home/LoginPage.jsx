import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { loginWithGoogle } from '../../api/authService'; // 커스텀 auth 함수
import { Google } from '@mui/icons-material';
import { FaComment } from 'react-icons/fa';

export default function LoginPage() {
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
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<Google />}
          onClick={loginWithGoogle}
        >
          Google<br />로그인
        </Button>
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
          카카오톡<br />로그인
        </Button>
      </Box>
    </Container>
  );
}