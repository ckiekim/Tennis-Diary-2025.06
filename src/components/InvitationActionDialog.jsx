import React from 'react';
import { Avatar, Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Typography } from '@mui/material';

/**
 * 클럽 초대 수락/거절 다이얼로그
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {function} props.onClose - 다이얼로그 닫기 함수
 * @param {function} props.onAccept - '수락' 버튼 클릭 시 실행될 함수
 * @param {function} props.onDecline - '거절' 버튼 클릭 시 실행될 함수
 * @param {object | null} props.invitation - 표시할 초대 정보 객체
 */
const InvitationActionDialog = ({ open, onClose, onAccept, onDecline, invitation }) => {
  // 초대 정보가 없으면 다이얼로그를 렌더링하지 않음
  if (!invitation) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>클럽 초대</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            src={invitation.clubProfileUrl || ''}
            alt={invitation.clubName}
            sx={{ width: 56, height: 56, mr: 2 }}
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">{invitation.clubName}</Typography>
            <Typography variant="body2" color="text.secondary">{invitation.region}</Typography>
          </Box>
        </Box>
        <DialogContentText>
          '{invitation.clubName}' 클럽의 초대를 수락하시겠습니까?
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: '0 24px 16px' }}>
        <Button onClick={onDecline} color="error">
          거절
        </Button>
        <Button onClick={onAccept} variant="contained" autoFocus>
          수락
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvitationActionDialog;