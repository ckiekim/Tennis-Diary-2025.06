import { Button, Dialog, DialogTitle, DialogContent, DialogActions, } from '@mui/material';

export default function DeleteConfirmDialog({ open, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>삭제 확인</DialogTitle>
      <DialogContent>정말로 삭제하시겠습니까?</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onConfirm} color="error" variant="contained">삭제</Button>
      </DialogActions>
    </Dialog>
  );
}
