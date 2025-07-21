import BottomNav from './BottomNav';
import TopRightCloseButton from './TopRightCloseButton';
import { AppBar, Box, Toolbar, Typography } from '@mui/material';

export default function MainLayout({ children, title = '' }) {
  return (
    <>
      {/* 상단 AppBar */}
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h5" noWrap sx={{ ml: 1, mt: 1 }}>
            {title}
          </Typography>
          <TopRightCloseButton />
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
