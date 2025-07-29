import React from 'react';
import { IconButton, Tooltip, Avatar } from '@mui/material';
import { Login } from '@mui/icons-material';
import { loginWithGoogle, logout } from '../api/authService';
import useAuthState from '../hooks/useAuthState';

export default function GoogleLoginButton() {
  const { user, loading } = useAuthState();

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
            <IconButton onClick={handleLogout} color="inherit">
              <Avatar src={user.photoURL} alt={user.displayName} sx={{ width: 28, height: 28 }} />
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
    </>
  );
}