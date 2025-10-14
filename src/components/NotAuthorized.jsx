import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import GppBadIcon from '@mui/icons-material/GppBad'; // '권한 없음'을 나타내는 아이콘
import { useNavigate } from 'react-router-dom';

/**
 * 사용자에게 페이지 접근 권한이 없음을 알리는 컴포넌트.
 * 홈으로 돌아가는 버튼을 제공합니다.
 */
const NotAuthorized = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        height: 'calc(100vh - 120px)', // 헤더, 푸터 높이를 제외한 영역을 채우도록 설정
        minHeight: '300px',
      }}
    >
      <GppBadIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
      
      <Typography variant="h5" component="h1" fontWeight="bold" gutterBottom>
        접근 권한이 없습니다
      </Typography>
      
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        요청하신 페이지를 볼 수 있는 권한이 없습니다.
      </Typography>
      
      <Button
        variant="contained"
        onClick={handleGoHome}
      >
        홈으로 돌아가기
      </Button>
    </Box>
  );
};

export default NotAuthorized;