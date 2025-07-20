import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SettingsIcon from '@mui/icons-material/Settings';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const getValue = () => {
    if (location.pathname.startsWith('/calendar')) return 'calendar';
    if (location.pathname.startsWith('/result')) return 'result';
    if (location.pathname.startsWith('/stat')) return 'stat';
    if (location.pathname.startsWith('/admin/courts')) return 'admin/courts';
    return '';
  };

  return (
    <Paper
      sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={getValue()}
        onChange={(event, newValue) => {
          navigate(`/${newValue}`);
        }}
      >
        <BottomNavigationAction label="일정" value="calendar" icon={<CalendarMonthIcon />} />
        <BottomNavigationAction label="결과" value="result" icon={<AssignmentIcon />} />
        <BottomNavigationAction label="통계" value="stat" icon={<BarChartIcon />} />
        <BottomNavigationAction label="용품" value="goods" icon={<CardGiftcardIcon />} />
        <BottomNavigationAction label="관리" value="admin/courts" icon={<SettingsIcon />} />
      </BottomNavigation>
    </Paper>
  );
};

export default BottomNav;