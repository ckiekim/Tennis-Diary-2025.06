import React from 'react';
import MainLayout from '../../components/MainLayout';
import ScheduleList from './ScheduleList';

const SchedulePage = () => {
  return (
    <MainLayout title='테니스 다이어리'>
      <ScheduleList />
    </MainLayout>
  );
};

export default SchedulePage;