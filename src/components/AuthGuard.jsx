import { useEffect, useRef } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import useAuthState from '../hooks/useAuthState';
import useUserSettings from '../hooks/useUserSettings';
import { getAuth, getRedirectResult } from 'firebase/auth';

const AuthGuard = () => {
  const { user, loading: authLoading } = useAuthState();
  const { settings, loading: settingsLoading } = useUserSettings();
  const location = useLocation();
  const redirectChecked = useRef(false);

  useEffect(() => {
    // StrictMode에서 에러를 방지하기 위한 일회성 실행 로직
    if (!redirectChecked.current) {
      const checkRedirectResult = async () => {
        try {
          const auth = getAuth();
          await getRedirectResult(auth);
        } catch (error) {
          // 리디렉션이 아닌 일반적인 페이지 로드 시 발생하는 자연스러운 오류이므로 무시합니다.
        }
      };
      checkRedirectResult();
      redirectChecked.current = true;
    }
  }, []);

  if (authLoading || settingsLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  // 2. 로딩이 끝난 후, 로그인 여부를 확인합니다.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 프로필 완성 여부를 확인
  const isProfileComplete = settings && settings.nickname && settings.location;

  if (!isProfileComplete && location.pathname !== '/setting') {
    return <Navigate to="/setting" replace />;
  }

  // 5. 프로필까지 완성된 일반 사용자는 통과시킵니다.
  return <Outlet />;
};

export default AuthGuard;