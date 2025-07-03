import React from 'react';
import { Box, } from '@mui/material';
import MainLayout from '../MainLayout';
import BottomNav from '../BottomNav';
import TennisDiary from './TennisDiary';

const CalendarPage = () => {
  return (
    <MainLayout>
      <TennisDiary />
    </MainLayout>
  );
};

export default CalendarPage;