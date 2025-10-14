import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuthState from '../hooks/useAuthState';
import useAdminCheck from '../hooks/useAdminCheck';

const AdminGuard = () => {
  const { user, loading: authLoading } = useAuthState();
  const { isAdmin, isAdminLoading } = useAdminCheck();

  // 사용자 인증 정보나 관리자 권한 정보를 확인 중일 때 로딩 화면 표시
  if (authLoading || isAdminLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // 로그인이 되어 있고, 관리자 권한이 있는 경우에만 요청된 페이지(Outlet)를 보여줌
  if (user && isAdmin) {
    return <Outlet />;
  }

  // 그 외의 경우 (비로그인, 일반 사용자)에는 메인 페이지로 리디렉션
  return <Navigate to="/" replace />;
};

export default AdminGuard;