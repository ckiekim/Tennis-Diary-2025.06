import React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Button
} from '@mui/material';

const DeleteConfirmDialog = ({ open, onClose, onConfirm, schedule }) => {
  if (!schedule) return null;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>삭제 확인</DialogTitle>
      <DialogContent>
        <DialogContentText>
          "{schedule.date} {schedule.type}" 일정을 삭제하시겠습니까? 
          이 작업은 되돌릴 수 없습니다.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onConfirm} variant="contained" color="error">삭제</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
