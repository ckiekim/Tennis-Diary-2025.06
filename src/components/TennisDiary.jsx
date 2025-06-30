import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
import KoreanDatePicker from './KoreanDatePicker';
import useEventDates from "../hooks/useEventDates";
import useScheduleByDate from "../hooks/useScheduleByDate";
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const TennisDiary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const eventDates = useEventDates();
  const schedules = useScheduleByDate(selectedDate);

  return (
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 다이어리
      </Typography>

      {/* 📅 한글 달력 */}
      <KoreanDatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        eventDates={eventDates}
      />

      {/* 선택된 날짜 정보 */}
      <Box mt={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon />
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedDate.format('YYYY.MM.DD (ddd)')} 일정
          </Typography>
        </Stack>

        {schedules.length === 0 ? (
          <Typography color="text.secondary" mt={1}>
            일정이 없습니다.
          </Typography>
        ) : (
          <Box mt={1}>
            {schedules.map((schedule) => (
              <Box
                key={schedule.id}
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  mb: 1,
                  backgroundColor: '#f9f9f9',
                }}
              >
                <Typography variant="subtitle2" fontWeight="bold">
                  {schedule.type}
                </Typography>
                <Typography variant="body2">⏰ {schedule.start_time} - {schedule.end_time}</Typography>
                <Typography variant="body2">📍 {schedule.place} 테니스장</Typography>
                {schedule.source && (
                  <Typography variant="body2">📝 {schedule.source}</Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default TennisDiary;