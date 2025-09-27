import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';

/**
 * 반복 일정의 수정 범위를 선택하는 다이얼로그
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {function} props.onClose - 다이얼로그 닫기 핸들러
 * @param {function} props.onConfirm - 선택지 버튼 클릭 핸들러. 선택한 범위('single' 또는 'future')를 인자로 받음.
 */
const UpdateScopeDialog = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>반복 일정 수정</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          이 반복 일정의 수정 범위를 선택해주세요.
        </DialogContentText>
        <Stack spacing={2}>
          <Button 
            variant="outlined" autoFocus
            onClick={() => onConfirm('single')}
          >
            이 일정만 수정
          </Button>
          <Button 
            variant="outlined" 
            onClick={() => onConfirm('future')}
          >
            이 일정 및 향후 모든 일정 수정
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateScopeDialog;