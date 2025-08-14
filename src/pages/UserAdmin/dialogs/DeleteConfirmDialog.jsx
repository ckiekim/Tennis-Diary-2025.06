import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

const DeleteConfirmDialog = ({ open, onClose, onConfirm, itemName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
    >
      <DialogTitle>삭제 확인</DialogTitle>
      <DialogContent>
        <DialogContentText>
          정말로 '{itemName}' 사용자를 삭제하시겠습니까?
          <br />
          이 작업은 되돌릴 수 없습니다.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onConfirm} color="error" autoFocus>
          삭제
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
