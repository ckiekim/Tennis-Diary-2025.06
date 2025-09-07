import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from '@mui/material';

/**
 * 범용 알림 다이얼로그 (alert() 대체)
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {function} props.onClose - 다이얼로그 닫기 및 확인 버튼 클릭 핸들러
 * @param {string} [props.title='알림'] - 다이얼로그 제목
 * @param {React.ReactNode} props.children - 다이얼로그에 표시될 내용
 */
const AlertDialog = ({ open, onClose, title = '테니스 다이어리 알림', children }) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0, mr: 0 }}>
          <Avatar src="/img/logo.png" alt="tennis diary logo" sx={{ width: 32, height: 32, mr: 1 }} />
          <Typography variant="h6" noWrap>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        {/* p 태그 대신 div로 렌더링되도록 component 속성 추가 */}
        <DialogContentText component="div">
          {children}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" autoFocus>
          확인
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AlertDialog;