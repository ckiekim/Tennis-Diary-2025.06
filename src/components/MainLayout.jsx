import { AppBar, Avatar, Box, IconButton, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserAvatar from './UserAvatar';
import BottomNav from './BottomNav';
// import TopRightCloseButton from './TopRightCloseButton';

export default function MainLayout({ children, title = '' }) {
  const navigate = useNavigate();
  const goToHome = () => { navigate('/'); }

  return (
    <>
      {/* 상단 AppBar */}
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
            <IconButton onClick={goToHome} color="inherit">
              <Avatar src="/logo192.png" alt="tennis diary logo" sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Typography variant="h5" noWrap>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
            <UserAvatar />
            {/* <TopRightCloseButton absolute={false} /> */}
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
