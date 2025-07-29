import { AppBar, Box, Toolbar, Typography } from '@mui/material';
import GoogleLoginButton from './GoogleLoginButton';
import BottomNav from './BottomNav';
import TopRightCloseButton from './TopRightCloseButton';

export default function MainLayout({ children, title = '' }) {
  return (
    <>
      {/* 상단 AppBar */}
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" noWrap sx={{ ml: 1, mt: 1 }}>
            {title}
          </Typography>
          {/* 오른쪽 영역: 로그인 버튼과 종료 버튼을 수평 정렬 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
            <GoogleLoginButton />
            <TopRightCloseButton absolute={false} />
          </Box>
        </Toolbar>
      </AppBar>

      {/* 본문 내용 */}
      <Box sx={{ pt: 8, pb: 8, px: 2 }}>
        {children}
      </Box>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </>
  );
}
