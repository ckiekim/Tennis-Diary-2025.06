import React from 'react';
import { Button, Container, Typography } from '@mui/material';
import { Google } from '@mui/icons-material';
import { loginWithGoogle } from '../../api/authService'; // 커스텀 auth 함수

export default function LoginPage() {
  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 10,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
      }}
    >
      <Typography variant="h4">로그인이 필요합니다</Typography>
      <Button
        variant="contained"
        startIcon={<Google />}
        onClick={loginWithGoogle}
      >
        Google로 로그인
      </Button>
    </Container>
  );
}