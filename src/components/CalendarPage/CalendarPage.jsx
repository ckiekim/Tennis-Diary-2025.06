import React from 'react';
import { Box, } from '@mui/material';
import BottomNav from '../BottomNav';
import TennisDiary from './TennisDiary';

const CalendarPage = () => {
  return (
    <>
      <Box sx={{ paddingBottom: '80px' }}>
        {/* 캘린더 컴포넌트 등 */}
        <TennisDiary />
      </Box>
      <BottomNav />
    </>
  );
};

export default CalendarPage;