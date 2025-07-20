import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import HomeIcon from '@mui/icons-material/HomeOutlined';

const TopRightCloseButton = ({ to = '/' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileExitDialog, setShowMobileExitDialog] = useState(false);
  const isHome = location.pathname === '/' || location.pathname === '/calendar';

  const handleClick = () => {
    if (isHome) {
      handleClose(true);
    } else {
      // 그 외에는 홈으로 이동
      navigate('/');
    }
  };

  const handleClose = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileExitDialog(true); // 다이얼로그 열기
    } else {
      if (window.confirm("앱을 종료하시겠습니까?")) {
        window.close();     // PC 크롬
      }
    }
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1000,
        }}
      >
        {isHome ? <CloseIcon /> : <HomeIcon />}
      </IconButton>

      <Dialog open={showMobileExitDialog} onClose={() => setShowMobileExitDialog(false)}>
        <DialogTitle>앱 종료</DialogTitle>
        <DialogContent>
          모바일 브라우저에서는 앱을 자동으로 종료할 수 없습니다.<br />
          기기의 뒤로가기 버튼을 누르거나 앱 전환 화면에서 종료해주세요.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMobileExitDialog(false)}>확인</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TopRightCloseButton;
