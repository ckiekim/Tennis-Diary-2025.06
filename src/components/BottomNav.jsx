import React, { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Menu, MenuItem, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, } from 'firebase/auth';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import SettingsIcon from '@mui/icons-material/Settings';
import RestoreIcon from '@mui/icons-material/Restore';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const BottomNav = () => {
  const [anchorElResult, setAnchorElResult] = useState(null);
  const [anchorElAdmin, setAnchorElAdmin] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAdmin = async () => {
    const user = getAuth().currentUser;
    if (user?.uid === 'uqoRhC7CDKUY1yeb2WhLgx2UDDn1') {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const getValueFromPath = (pathname) => {
    if (pathname.startsWith('/result')) return 'result';
    if (pathname.startsWith('/calendar')) return 'calendar';
    if (pathname.startsWith('/goods')) return 'goods';
    if (pathname.startsWith('/admin')) return 'admin';
    if (pathname.startsWith('/more')) return 'more';
    return 'calendar';
  };
  const value = getValueFromPath(location.pathname);

  const handleNavClick  = (event, newValue) => {
    if (newValue === 'result') {
      setAnchorElResult(event.currentTarget);
    } else if (newValue === 'admin') {
      setAnchorElAdmin(event.currentTarget);
    } else {
      switch (newValue) {
        case 'calendar':
          navigate('/calendar');
          break;
        case 'goods':
          navigate('/goods');
          break;
        case 'more':
          navigate('/more');
          break;
        default:
          navigate('/');
      }
    }
  };

  const handleResultMenuClick = (path) => {
    setAnchorElResult(null);
    navigate(path);
  };

  const handleAdminMenuClick = (path) => {
    setAnchorElAdmin(null);
    navigate(path);
  };

  return (
    <>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleNavClick} showLabels>
          <BottomNavigationAction label="일정" value="calendar" icon={<CalendarMonthIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="결과" value="result" icon={<AssignmentIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="용품" value="goods" icon={<CardGiftcardIcon />} sx={{ minWidth: 60 }} />
          {isAdmin &&
            <BottomNavigationAction label="관리" value="admin" icon={<SettingsIcon />} sx={{ minWidth: 60 }} />
          }
          <BottomNavigationAction label="더보기" value="more" icon={<MoreHorizIcon />} sx={{ minWidth: 60 }} />
        </BottomNavigation>
      </Paper>
      {/* 결과 드롭다운 */}
      <Menu
        anchorEl={anchorElResult}
        open={Boolean(anchorElResult)}
        onClose={() => setAnchorElResult(null)}
      >
        <MenuItem onClick={() => handleResultMenuClick('/result/game')}>
          <SportsTennisIcon fontSize="small" sx={{ mr: 1 }} />
          게임결과
        </MenuItem>
        <MenuItem onClick={() => handleResultMenuClick('/result/tournament')}>
          <RestoreIcon fontSize="small" sx={{ mr: 1 }} />
          대회결과
        </MenuItem>
        <MenuItem onClick={() => handleResultMenuClick('/result/stat')}>
          <BarChartIcon fontSize="small" sx={{ mr: 1 }} />
          통계
        </MenuItem>
      </Menu>

      {/* 관리 드롭다운 */}
      {isAdmin &&
        <Menu
          anchorEl={anchorElAdmin}
          open={Boolean(anchorElAdmin)}
          onClose={() => setAnchorElAdmin(null)}
        >
          <MenuItem onClick={() => handleAdminMenuClick('/admin/courts')}>
            <SportsTennisIcon fontSize="small" sx={{ mr: 1 }} />
            코트관리
          </MenuItem>
          <MenuItem onClick={() => handleAdminMenuClick('/admin/users')}>
            <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
            사용자관리
          </MenuItem>
        </Menu>
      }
    </>
  );
};

export default BottomNav;