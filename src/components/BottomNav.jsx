import React, { useEffect, useState } from 'react';
import { BottomNavigation, BottomNavigationAction, Divider, Menu, MenuItem, Paper } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth, } from 'firebase/auth';
import { ADMIN_UIDS } from '../constants/admin';

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BarChartIcon from '@mui/icons-material/BarChart';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import RestoreIcon from '@mui/icons-material/Restore';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import PeopleIcon from '@mui/icons-material/People';
import StyleIcon from '@mui/icons-material/Style';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import GavelIcon from '@mui/icons-material/Gavel';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';
import GroupsIcon from '@mui/icons-material/Groups';
import WidgetsIcon from '@mui/icons-material/Widgets';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

const BottomNav = () => {
  const [anchorElResult, setAnchorElResult] = useState(null);
  const [anchorElTools, setAnchorElTools] = useState(null);
  const [anchorElMore, setAnchorElMore] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAdmin = async () => {
    const user = getAuth().currentUser;
    if (user && ADMIN_UIDS.includes(user.uid)) {
      setIsAdmin(true);
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  const getValueFromPath = (pathname) => {
    if (pathname.startsWith('/schedule')) return 'schedule';
    if (pathname.startsWith('/result')) return 'result';
    if (pathname.startsWith('/clubs')) return 'clubs';
    if (pathname.startsWith('/tools')) return 'tools';
    if (pathname.startsWith('/more')) return 'more';
    return 'schedule';
  };
  const value = getValueFromPath(location.pathname);

  const handleNavClick  = (event, newValue) => {
    if (newValue === 'result') {
      setAnchorElResult(event.currentTarget);
    } else if (newValue === 'tools') {
      setAnchorElTools(event.currentTarget);
    } else if (newValue === 'more') {
      setAnchorElMore(event.currentTarget);
    } else {
      switch (newValue) {
        case 'schedule':
          navigate('/schedule');
          break;
        case 'clubs':
          navigate('/clubs');
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

  const handleToolsMenuClick = (path) => {
    setAnchorElTools(null);
    navigate(path);
  };

  const handleMoreMenuClick = (path) => {
    setAnchorElMore(null);
    navigate(path);
  };

  return (
    <>
      <Paper
        sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100, }}
        elevation={3}
      >
        <BottomNavigation value={value} onChange={handleNavClick} showLabels>
          <BottomNavigationAction label="일정" value="schedule" icon={<CalendarMonthIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="결과" value="result" icon={<AssignmentIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="클럽" value="clubs" icon={<GroupsIcon />} sx={{ minWidth: 60 }} />
          <BottomNavigationAction label="관리" value="tools" icon={<WidgetsIcon />} sx={{ minWidth: 60 }} />
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
          게임결과 &nbsp;&nbsp;
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
      <Menu
        anchorEl={anchorElTools}
        open={Boolean(anchorElTools)}
        onClose={() => setAnchorElTools(null)}
      >
        <MenuItem onClick={() => handleToolsMenuClick('/tools/goods')}>
          <CardGiftcardIcon fontSize="small" sx={{ mr: 1 }} />
          용품
        </MenuItem>
        <MenuItem onClick={() => handleToolsMenuClick('/tools/expense')}>
          <ReceiptLongIcon fontSize="small" sx={{ mr: 1 }} />
          비용
        </MenuItem>
        {isAdmin && [
          <Divider key="admin-divider" sx={{ my: 0.5 }} />,
          <MenuItem key="courts-menu" onClick={() => handleToolsMenuClick('/tools/courts')}>
            <SportsTennisIcon fontSize="small" sx={{ mr: 1 }} />
            코트관리
          </MenuItem>,
          <MenuItem key="users-menu" onClick={() => handleToolsMenuClick('/tools/users')}>
            <PeopleIcon fontSize="small" sx={{ mr: 1 }} />
            사용자관리
          </MenuItem>
        ]}
      </Menu>

      {/* 더보기 드롭다운 */}
      <Menu
        anchorEl={anchorElMore}
        open={Boolean(anchorElMore)}
        onClose={() => setAnchorElMore(null)}
      >
        <MenuItem onClick={() => handleMoreMenuClick('/more/advertise')}>
          <StyleIcon fontSize="small" sx={{ mr: 1 }} />
          특장점
        </MenuItem>
        <MenuItem onClick={() => handleMoreMenuClick('/more/mileageInfo')}>
          <MonetizationOnIcon fontSize="small" sx={{ mr: 1 }} />
          마일리지 안내
        </MenuItem>
        <MenuItem onClick={() => handleMoreMenuClick('/more/appInfo')}>
          <InfoOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
          앱 정보
        </MenuItem>
        <MenuItem onClick={() => handleMoreMenuClick('/more/agreement')}>
          <GavelIcon fontSize="small" sx={{ mr: 1 }} />
          이용 약관
        </MenuItem>
        <MenuItem onClick={() => handleMoreMenuClick('/more/installGuide')}>
          <DownloadForOfflineIcon fontSize="small" sx={{ mr: 1 }} />
          앱 설치안내
        </MenuItem>
      </Menu>
    </>
  );
};

export default BottomNav;