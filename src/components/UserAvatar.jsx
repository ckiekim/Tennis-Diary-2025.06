import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar, Box, Divider, IconButton, Menu, MenuItem, Typography,
  Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle 
 } from '@mui/material';
import { logout } from '../api/authService';
import useAuthState from '../hooks/useAuthState';
import useUserSettings from '../hooks/useUserSettings';

export default function UserAvatar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, loading: authLoading } = useAuthState(); 
  // Firestore의 실시간 데이터를 가져옴
  const { settings, loading: settingsLoading } = useUserSettings();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

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

  /**
   * 웹-앱을 종료하는 함수
   * 네이티브 앱의 WebView 환경에 따라 특정 인터페이스를 호출
   */
  const handleExit = () => {
    setIsMenuOpen(false);
    if (window.Android && typeof window.Android.closeApp === 'function') {
      window.Android.closeApp();
    } else if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.closeApp) {
      window.webkit.messageHandlers.closeApp.postMessage('close');
    } else {
      if (isMobile)
        setIsExitDialogOpen(true);
      else
        alert('브라우저의 보안 정책에 따라 스크립트로 창을 닫을 수 없습니다. \n브라우저의 탭 닫기 버튼을 이용해 주세요.');
    }
  };

  const handleExitDialogClose = () => {
    setIsExitDialogOpen(false);
  };

  if (authLoading || settingsLoading) return null;

  return (
    <>
      {user && settings && (
        <IconButton onClick={handleMenuToggle} color="inherit">
          <Avatar src={settings.photo} alt={settings.nickname} sx={{ width: 32, height: 32 }} />
        </IconButton>
      )}

      {isMenuOpen && (
        <Menu
          open={isMenuOpen}
          onClose={handleMenuToggle}
          anchorEl={anchorEl}
        >
          <Box sx={{ padding: '12px 16px' }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              {settings.nickname}님
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />
          <MenuItem onClick={handleSettings}>프로필 설정</MenuItem>
          <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
          <MenuItem onClick={handleExit}>종료</MenuItem>
        </Menu>
      )}

      <Dialog
        open={isExitDialogOpen}
        onClose={handleExitDialogClose}
      >
        <DialogTitle>앱 종료 안내</DialogTitle>
        <DialogContent>
          <DialogContentText>
            브라우저의 보안 정책으로 인해 앱을 직접 닫을 수 없습니다.
            <br /><br />
            스마트폰의 '최근 실행 앱' 목록(작업 관리자)에서 직접 앱을 종료해 주세요.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleExitDialogClose} autoFocus>
            확인
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}