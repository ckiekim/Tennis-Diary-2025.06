import { useEffect } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuthState from '../hooks/useAuthState';
import useUserSettings from '../hooks/useUserSettings';
import { getRedirectResult } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';

const AuthGuard = () => {
  const { user, loading: authLoading } = useAuthState();
  const { isNewUser, loading: settingsLoading } = useUserSettings();
  const location = useLocation(); // 현재 경로를 확인하기 위함

  // --- 리디렉션 결과 처리 ---
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        // result가 null이 아니면, 방금 로그인을 마치고 돌아온 것
        if (result) {
          // 이 때 사용자가 생성되거나 로그인 상태가 갱신됨
          // useAuthState가 자동으로 변경을 감지하므로 특별한 처리는 불필요.
          console.log('리디렉션 로그인 성공:', result.user);
        }
      } catch (error) {
        console.error('Google 로그인 결과 처리 실패:', error);
      }
    };
    
    checkRedirectResult();
  }, []);

  // 인증 정보나 설정 정보를 로딩 중일 때는 로딩 화면 표시
  if (authLoading || settingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // 로그인이 되어 있지 않다면 로그인 페이지로 리디렉션
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 로그인이 되어 있고, 신규 사용자이며, 현재 경로가 '/setting'이 아니라면
  // 프로필 설정 페이지로 리디렉션
  if (isNewUser && location.pathname !== '/setting') {
    return <Navigate to="/setting" replace />;
  }

  // 모든 조건을 통과하면 요청한 페이지를 보여줌 (Outlet)
  return <Outlet />;
};

export default AuthGuard;