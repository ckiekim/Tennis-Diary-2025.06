import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../api/firebaseConfig';
import { doc, writeBatch, serverTimestamp, increment, deleteDoc, updateDoc } from 'firebase/firestore';
import { Avatar, Badge, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Divider, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack, Typography,
 } from '@mui/material';
import { logout } from '../api/authService';
import useAuthState from '../hooks/useAuthState';
import useUserSettings from '../hooks/useUserSettings';
import useInvitations from '../hooks/useInvitation';
import useNotifications from '../hooks/useNotifications';
import InvitationActionDialog from './InvitationActionDialog';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

export default function UserAvatar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExitDialogOpen, setIsExitDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedInvitation, setSelectedInvitation] = useState(null);

  const { user, loading: authLoading } = useAuthState(); 
  const { settings, loading: settingsLoading } = useUserSettings();
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const { invitations } = useInvitations(user?.uid);
  const { notifications } = useNotifications(user?.uid);

  const unreadNotifications = notifications.filter(n => !n.isRead);
  const totalBadgeCount = invitations.length + unreadNotifications.length;
  const navigate = useNavigate();

  const handleMenuToggle = (event) => {
    setAnchorEl(event.currentTarget);
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setIsMenuOpen(false);
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

  const handleInvitationClick = (invitation) => {
    handleMenuClose();
    setSelectedInvitation(invitation); // 선택한 초대 정보 저장 -> 다이얼로그 열림
  };

  const handleInvitationDialogClose = () => {
    setSelectedInvitation(null); // 선택한 초대 정보 초기화 -> 다이얼로그 닫힘
  };

  // --- 초대 수락/거절 Firestore 로직 추가 ---
  const handleAcceptInvitation = async () => {
    if (!selectedInvitation || !user) return;
    try {
      const batch = writeBatch(db);
      const memberRef = doc(db, 'clubs', selectedInvitation.clubId, 'members', user.uid);
      batch.update(memberRef, { status: 'member', joinedAt: serverTimestamp() });

      const myClubRef = doc(db, 'users', user.uid, 'myClubs', selectedInvitation.clubId);
      batch.set(myClubRef, {
        clubName: selectedInvitation.clubName,
        clubProfileUrl: selectedInvitation.clubProfileUrl || '',
        region: selectedInvitation.region, // 초대 데이터에 region이 있어야 함
        ownerName: selectedInvitation.ownerName, // 초대 데이터에 ownerName이 있어야 함
        role: 'member',
        joinedAt: serverTimestamp(),
      });

      const clubRef = doc(db, 'clubs', selectedInvitation.clubId);
      batch.update(clubRef, { memberCount: increment(1) });

      await batch.commit();
      alert(`${selectedInvitation.clubName} 클럽에 가입되었습니다!`);
    } catch (error) {
      console.error("초대 수락 실패:", error);
    } finally {
      handleInvitationDialogClose();
    }
  };

  const handleDeclineInvitation = async () => {
    if (!selectedInvitation || !user) return;
    try {
      const memberRef = doc(db, 'clubs', selectedInvitation.clubId, 'members', user.uid);
      await deleteDoc(memberRef);
      alert(`${selectedInvitation.clubName} 클럽 초대를 거절했습니다.`);
    } catch (error) {
      console.error("초대 거절 실패:", error);
    } finally {
      handleInvitationDialogClose();
    }
  };

  const handleNotificationClick = async (notification) => {
    handleMenuClose(); // 메뉴를 즉시 닫음

    try {
      // Firestore에서 해당 알림 문서를 '읽음' 상태로 업데이트
      const notiRef = doc(db, 'users', user.uid, 'notifications', notification.id);
      await updateDoc(notiRef, { isRead: true });

      // 알림에 포함된 링크 정보가 있다면 해당 경로로 이동
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error("알림 처리 중 오류 발생:", error);
    }
  };

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
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton onClick={handleMenuToggle} color="inherit">
            <Badge 
              color="error" 
              invisible={totalBadgeCount === 0}
              badgeContent={totalBadgeCount}
            />
            <Avatar src={settings.photo} alt={settings.nickname} sx={{ width: 32, height: 32, marginLeft: 1 }} />
          </IconButton>
        </Stack>
      )}

      {isMenuOpen && (
        <Menu
          open={isMenuOpen}
          onClose={handleMenuClose}
          anchorEl={anchorEl}
        >
          <Box sx={{ padding: '12px 16px' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {settings.nickname}님
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <MonetizationOnIcon color="action" sx={{ fontSize: 18 }} />
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {settings.mileage?.toLocaleString() || 0}
                </Typography>
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Divider sx={{ my: 0.5 }} />

          {invitations.length > 0 && (
            <div>
              {invitations.map((inv) => (
                <MenuItem key={inv.clubId} onClick={() => handleInvitationClick(inv)}>
                  <ListItemIcon>
                    <MailOutlineIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={`${inv.clubName} 클럽 초대`} 
                    primaryTypographyProps={{ variant: 'body2', fontWeight: 'bold' }}
                  />
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5 }} />
            </div>
          )}

          {unreadNotifications.length > 0 && (
            <div>
              <Divider sx={{ my: 0.5 }} />
              {unreadNotifications.map((noti) => (
                <MenuItem key={noti.id} onClick={() => handleNotificationClick(noti)}>
                  {/* ... 알림 내용 렌더링 ... */}
                  <ListItemText primary={noti.message} />
                </MenuItem>
              ))}
              <Divider sx={{ my: 0.5 }} />
            </div>
          )}

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

      <InvitationActionDialog
        open={!!selectedInvitation}
        onClose={handleInvitationDialogClose}
        onAccept={handleAcceptInvitation}
        onDecline={handleDeclineInvitation}
        invitation={selectedInvitation}
      />
    </>
  );
}