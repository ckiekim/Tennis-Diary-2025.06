import React, { useState } from 'react';
import {
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Box,
  Stack
} from '@mui/material';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AddIcon from '@mui/icons-material/Add';
import dayjs from 'dayjs';

const events = [
  {
    date: '2025-06-20',
    type: '레슨',
    time: '09:00 - 09:20',
    location: '레드브릭 테니스장',
  },
  {
    date: '2025-06-20',
    type: '게임',
    time: '20:00 - 22:00',
    location: '리버사이드 테니스장',
  },
];

const TennisDiary = () => {
  const [selectedDate, setSelectedDate] = useState('2025-06-20');

  const filteredEvents = events.filter(e => e.date === selectedDate);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        🎾 테니스 다이어리 - {dayjs(selectedDate).format('YYYY.MM.DD (ddd)')}
      </Typography>

      {/* 달력 대체용 타이틀 */}
      <Box mb={2}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon />
          <Typography variant="subtitle1">2025년 6월 달력</Typography>
          <Button size="small" startIcon={<AddIcon />} variant="outlined">
            일정 추가
          </Button>
        </Stack>
      </Box>

      {/* 일정 리스트 */}
      <Grid container spacing={2}>
        {filteredEvents.map((event, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">{event.type}</Typography>
                  <Chip
                    label={event.type === '레슨' ? '○ 레슨' : '◎ 게임'}
                    color={event.type === '레슨' ? 'info' : 'success'}
                    size="small"
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  ⏰ {event.time}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📍 {event.location}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* 일정 상세 */}
      <Box mt={4}>
        <Typography variant="h6">상세 정보</Typography>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2">장소: 리버사이드 테니스장</Typography>
        <Typography variant="body2">참가자: 남 0 / 여 0 / 총 0명</Typography>
        <Typography variant="body2">비용: 0원</Typography>
        <Typography variant="body2">메모: 스매시</Typography>
      </Box>
    </Container>
  );
};

export default TennisDiary;
