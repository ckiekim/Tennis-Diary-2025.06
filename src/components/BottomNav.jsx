import React, { useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Menu, MenuItem, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SettingsIcon from '@mui/icons-material/Settings';
import RestoreIcon from '@mui/icons-material/Restore';
// import EventNoteIcon from '@mui/icons-material/EventNote';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const BottomNav = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const getValueFromPath = (pathname) => {
    if (pathname.startsWith('/result')) return 'result';
    if (pathname.startsWith('/calendar')) return 'calendar';
    if (pathname.startsWith('/goods')) return 'goods';
    if (pathname.startsWith('/admin')) return 'admin/courts';
    return 'calendar';
  };

  const handleChange = (event, newValue) => {
    if (newValue === 'result') {
      setAnchorEl(event.currentTarget); // 메뉴 열기
    } else {
      switch (newValue) {
        case 'calendar':
          navigate('/calendar');
          break;
        case 'goods':
          navigate('/goods');
          break;
        case 'admin/courts':
          navigate('/admin/courts');
          break;
        default:
          navigate('/');
      }
    }
  };

  const value = getValueFromPath(location.pathname);

  const handleMenuClick = (path) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleChange} showLabels>
          <BottomNavigationAction label="일정" value="calendar" icon={<CalendarMonthIcon />} />
          <BottomNavigationAction label="결과" value="result" icon={<AssignmentIcon />} />
          <BottomNavigationAction label="용품" value="goods" icon={<CardGiftcardIcon />} />
          <BottomNavigationAction label="관리" value="admin/courts" icon={<SettingsIcon />} />
        </BottomNavigation>
      </Paper>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem onClick={() => handleMenuClick('/result/game')}>
          <SportsTennisIcon fontSize="small" sx={{ mr: 1 }} />
          게임결과
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/result/tournament')}>
          <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
          대회결과
        </MenuItem>
        <MenuItem onClick={() => handleMenuClick('/result/stat')}>
          <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
          통계
        </MenuItem>
      </Menu>
    </>
  );
};

export default BottomNav;