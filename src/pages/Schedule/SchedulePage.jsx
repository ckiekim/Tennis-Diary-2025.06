import React, { useMemo, useState } from 'react';
import { Box, Fab, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

import useAuthState from '../../hooks/useAuthState';
import useEventDateMap from '../../hooks/useEventDateMap';
import useScheduleByDate from '../../hooks/useScheduleByDate';
import useCourtList from '../../hooks/useCourtList';
import useHolidays from '../../hooks/useHolidays';
import { useScheduleManager } from '../../hooks/useScheduleManager';

import KoreanDatePicker from './components/KoreanDatePicker';
import ScheduleCard from './components/ScheduleCard';
import ScheduleDialogs from './components/ScheduleDialogs';
import MainLayout from '../../components/MainLayout';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const SchedulePage = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey(prev => prev + 1);

  const { user } = useAuthState();
  const courts = useCourtList();
  const { holidays } = useHolidays(selectedDate.year());
  const holidayName = useMemo(() => {
    const ymd = selectedDate.format('YYYY-MM-DD');
    const holiday = holidays.find(h => h.date === ymd);
    return holiday ? holiday.name : '';
  }, [selectedDate, holidays]);
  
  // 데이터 로직과 상태 관리를 커스텀 훅으로 위임
  const manager = useScheduleManager(selectedDate, user, courts);
  
  // UI 렌더링에 필요한 데이터는 훅에서 가져옴
  const eventDateMap = useEventDateMap(refreshKey);
  const schedules = useScheduleByDate(selectedDate, refreshKey);


  return (
    <MainLayout title='테니스 다이어리'>
      <KoreanDatePicker value={selectedDate} onChange={setSelectedDate} eventDateMap={eventDateMap}/>

      <Box mt={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon />
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedDate.format('YYYY.MM.DD (ddd)')}
            {holidayName && 
              <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '9px' }}>{holidayName}</span>
            } 
          </Typography>
        </Stack>

        {schedules.length === 0 ? (
          <Typography color="text.secondary" mt={1}>
            일정이 없습니다.
          </Typography>
        ) : (
          <Box mt={1}>
            {schedules.map(schedule => ( 
              <ScheduleCard 
                key={schedule.id}
                schedule={schedule}
                onResult={manager.handleResultDialog} 
                onEdit={user?.uid === schedule.uid ? manager.handleEdit : undefined} 
                onDelete={user?.uid === schedule.uid ? manager.handleDelete : undefined} 
              />
            ))}
          </Box>
        )}
      </Box>

      <Fab
        color="default"
        sx={{
          position: 'fixed', bottom: 80, right: 24, backgroundColor: 'black', color: 'white', zIndex: 20,
          '&:hover': { backgroundColor: '#333', },
        }}
        onClick={manager.handleOpenAddDialog}
      >
        <AddIcon />
      </Fab>

      {/* 다이얼로그들을 별도 컴포넌트로 분리하여 UI를 깔끔하게 유지 */}
      <ScheduleDialogs manager={manager} courts={courts} user={user} refresh={refresh} />
    </MainLayout>
  );
};

export default SchedulePage;