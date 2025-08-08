import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { logout } from '../api/authService';
import useAuthState from '../hooks/useAuthState';
import useUserSettings from '../hooks/useUserSettings';

export default function UserAvatar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, loading: authLoading } = useAuthState(); 
  // Firestore의 실시간 데이터를 가져오기 위해 useUserSettings를 사용합니다.
  const { settings, loading: settingsLoading } = useUserSettings();

  const navigate = useNavigate();

  const handleMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    try {
      await logout();
    } catch (error) {
      alert('로그아웃에 실패했습니다.');
    }
  };

  const handleSettings = () => {
    setIsMenuOpen(false);
    navigate('/setting');
  }

  if (authLoading || settingsLoading) return null;

  return (
    <>
      {user && settings && (
        <Tooltip title={`${settings.nickname}님`}>
          <IconButton onClick={handleMenuToggle} color="inherit">
            <Avatar src={settings.photo} alt={settings.nickname} sx={{ width: 32, height: 32 }} />
          </IconButton>
        </Tooltip>
      )}

      {isMenuOpen && (
        <Menu
          open={isMenuOpen}
          onClose={handleMenuToggle}
          anchorEl={anchorEl}
        >
          <MenuItem onClick={handleSettings}>프로필 설정</MenuItem>
          <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
        </Menu>
      )}
    </>
  );
}