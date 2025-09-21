import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, Container, IconButton, Stack, Tooltip, Typography } from '@mui/material';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../../api/firebaseConfig';
import AlertDialog from '../../components/AlertDialog';
import { FaComment } from 'react-icons/fa';
import InfoIcon from '@mui/icons-material/Info';

export default function LoginPage() {
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const navigate = useNavigate();
  const guideNavigate = (num) => navigate('/guide/' + num);
  const guidePages = [
    { num: 1, title: '앱 설치 안내' },
    { num: 2, title: '가입 및 초기 프로필 설정 안내' },
    { num: 3, title: '일정 관리 안내' },
    { num: 4, title: '결과 안내' },
    { num: 5, title: '클럽 안내' },
    { num: 6, title: '용품 관리 안내' },
    { num: 7, title: '비용 관리 안내' },
  ];

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
      setAlertMessage('로그인에 실패했습니다.');
      setIsAlertOpen(true);
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
      setAlertMessage('카카오 SDK를 불러오지 못했습니다.');
      setIsAlertOpen(true);
      return;
    }

    window.Kakao.Auth.authorize({
      redirectUri: process.env.REACT_APP_KAKAO_REDIRECT_URI,
    });
  }

  return (
    <Container
      maxWidth="sm"
      sx={{ mt: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 2, }}
    >
      <img src="/img/logo.png" alt="Logo" style={{ maxWidth: '300px', margin: '0 auto' }} />
      <Typography variant="h6" sx={{mt: 5, mb: 2}}>로그인이 필요합니다</Typography>
      <Box 
        sx={{ 
          display: 'flex',  flexDirection: { xs: 'column', sm: 'row' }, // 모바일에서는 세로, 데스크탑에서는 가로 정렬
          justifyContent: 'center',  alignItems: 'center', gap: 1, height: '50px',
        }}
      >
        <div id="googleSignInButton"></div>
        <Button
          variant="contained"
          startIcon={<FaComment />}
          sx={{
            color: '#000000', backgroundColor: '#FEE500', // 카카오톡 공식 색상
            '&:hover': { backgroundColor: '#FEE500', }    // hover 시에도 색상 유지
          }}
          onClick={handleKakaoLogin}
        >
          카카오 로그인
        </Button>
      </Box>
      <Box sx={{ 
          display: 'flex', flexDirection: 'column', // 세로로 배치
          alignItems: 'center', // 가운데 정렬
          gap: 1, // 버튼 사이 간격
          mt: 8, mb: 2
        }}
      >
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Button
            variant="outlined" 
            startIcon={<InfoIcon />} 
            onClick={() => navigate('/guide/merit')}
          >
            앱 둘러보기 (주요 기능)
          </Button>
        </Stack>
        <Stack direction="row" spacing={0}>
          {guidePages.map((page) => (
            <Tooltip title={page.title} key={page.num}>
              <IconButton color="inherit" onClick={() => guideNavigate(page.num)}>
                <Avatar sx={{ width: 28, height: 28, fontSize: '1rem', bgcolor: 'primary.main' }}>
                  {page.num}
                </Avatar>
              </IconButton>
            </Tooltip>
          ))}
        </Stack>
      </Box>

      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </Container>
  );
}