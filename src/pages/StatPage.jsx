import React from 'react';
import { Box, Typography } from '@mui/material';
import BottomNav from '../components/BottomNav';

const StatPage = () => {
  return (
    <>
      <Box
        sx={{
          padding: 3,
          textAlign: 'center',
          paddingBottom: '80px',
        }}
      >
        <Typography variant="h6" fontWeight="bold" gutterBottom>
          📊 테니스 다이어리 통계
        </Typography>
        <Typography marginTop={10} variant="body1" color="text.secondary">
          통계 페이지는 추후 확정 예정입니다.
        </Typography>
      </Box>

      <BottomNav />
    </>
  );
};

export default StatPage;