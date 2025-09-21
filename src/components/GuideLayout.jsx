import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Avatar, Box, Container, IconButton, Toolbar, Typography } from '@mui/material';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupsIcon from '@mui/icons-material/Groups';
import WidgetsIcon from '@mui/icons-material/Widgets';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

export default function GuideLayout({ children, title = '테니스 다이어리' }) {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      {/* 상단 AppBar */}
      <AppBar position="fixed" color="inherit" elevation={0}>
        <Toolbar sx={{ justifyContent: 'space-between', mt: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
            <IconButton color="inherit" onClick={() => navigate('/')}>
              <Avatar src="/img/logo.png" alt="tennis diary logo" sx={{ width: 32, height: 32 }} />
            </IconButton>
            <Typography variant="h5" noWrap>
              {title}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
            <IconButton color="inherit" disabled>
              <Avatar src="/img/sample_avatar.jpg" sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* 본문 내용 */}
      <Box sx={{ pt: 8, pb: 8, px: 2 }}>
        {children}
      </Box>

      {/* 하단 네비게이션 */}
      <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100 }}
        elevation={3}
      >
        <BottomNavigation value="schedule" showLabels>
          <BottomNavigationAction label="일정" value="schedule" icon={<CalendarMonthIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="결과" value="result" icon={<AssignmentIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="클럽" value="clubs" icon={<GroupsIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="관리" value="tools" icon={<WidgetsIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="더보기" value="more" icon={<MoreHorizIcon />} sx={{ minWidth: 60 }} />
        </BottomNavigation>
      </Paper>
    </Container>
  );
}