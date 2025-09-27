import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

/**
 * 범용 삭제 확인 다이얼로그
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {function} props.onClose - 다이얼로그 닫기 핸들러
 * @param {function} props.onConfirm - 확인 버튼 클릭 핸들러
 * @param {React.ReactNode} props.children - 다이얼로그에 표시될 내용
 */
const ConfirmDialog = ({ open, onClose, onConfirm, children, title = '삭제' }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{title} 확인</DialogTitle>
      <DialogContent>
        {/* p 태그 대신 div로 렌더링되도록 component 속성 추가 */}
        <DialogContentText component="div">
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={onConfirm} variant="contained" color="error" autoFocus>
          {title}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
