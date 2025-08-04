import React, { useState } from 'react';
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { Login } from '@mui/icons-material';
import { loginWithGoogle, logout } from '../api/authService';
import useAuthState from '../hooks/useAuthState';

export default function GoogleLoginButton() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, loading } = useAuthState();

  const handleMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error) {
      alert('로그인에 실패했습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      alert('로그아웃에 실패했습니다.');
    }
  };

  if (loading) return null;

  return (
    <>
      {user ? (
        <>
          <Tooltip title={`${user.displayName}님`}>
            <IconButton onClick={handleMenuToggle} color="inherit">
              <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 32, height: 32 }} />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        <Tooltip title="Google로 로그인">
          <IconButton onClick={handleLogin} color="inherit">
            <Login />
          </IconButton>
        </Tooltip>
      )}

      {isMenuOpen && (
        <Menu
          open={isMenuOpen}
          onClose={handleMenuToggle}
          anchorEl={anchorEl}
        >
          <MenuItem onClick={() => { setIsMenuOpen(false); handleLogout(); }}>로그아웃</MenuItem>
          <MenuItem onClick={() => { setIsMenuOpen(false); }}>사용설정</MenuItem>
        </Menu>
      )}
    </>
  );
}