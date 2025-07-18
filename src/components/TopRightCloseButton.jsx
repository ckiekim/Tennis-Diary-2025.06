import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate, useLocation } from 'react-router-dom';

const TopRightCloseButton = ({ to = '/' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = () => {
    if (location.pathname === '/' || location.pathname === '/calendar') {
      // 초기 화면에서는 브라우저 닫기 시도
      if (window.confirm('앱을 종료하시겠습니까?')) {
        window.close();
      }
    } else {
      // 그 외에는 홈으로 이동
      navigate('/');
    }
  };

  return (
    <IconButton
      onClick={handleClick}
      sx={{
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1000,
      }}
    >
      <CloseIcon />
    </IconButton>
  );
};

export default TopRightCloseButton;
