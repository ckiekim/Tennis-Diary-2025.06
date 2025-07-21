import React from 'react';
import MainLayout from '../MainLayout';
import TennisDiary from './TennisDiary';

const CalendarPage = () => {
  return (
    <MainLayout title='🎾 테니스 다이어리'>
      <TennisDiary />
    </MainLayout>
  );
};

export default CalendarPage;