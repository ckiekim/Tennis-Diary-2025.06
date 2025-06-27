import React, { useState } from 'react';
import { Container, Typography, Box, Card, CardContent, Chip, Stack } from '@mui/material';
import dayjs from 'dayjs';
import KoreanDatePicker from './KoreanDatePicker';

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
  const [selectedDate, setSelectedDate] = useState(dayjs('2025-06-20'));
  const filteredEvents = events.filter(
    (e) => e.date === selectedDate.format('YYYY-MM-DD')
  );

  return (
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 다이어리
      </Typography>

      {/* 📅 한글 달력 */}
      <Box>
        <KoreanDatePicker value={selectedDate} onChange={setSelectedDate} />
      </Box>

      {/* 일정 제목 */}
      <Typography variant="h6" sx={{ mb: 1, fontSize: { xs: '16px', sm: '18px' } }}>
        📆 {selectedDate.format('YYYY.MM.DD (ddd)')} 일정
      </Typography>

      {/* 일정 리스트 */}
      {filteredEvents.length === 0 ? (
        <Typography color="text.secondary">일정이 없습니다.</Typography>
      ) : (
        filteredEvents.map((event, idx) => (
          <Card
            key={idx}
            variant="outlined"
            sx={{
              mb: 1.5,
              px: 1,
              py: 1,
              borderRadius: 2,
              backgroundColor: '#f9f9f9',
            }}
          >
            <CardContent sx={{ p: 1 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{ fontSize: { xs: '15px', sm: '16px' }, fontWeight: 'bold' }}
                >
                  {event.type}
                </Typography>
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
        ))
      )}
    </Container>
  );
};

export default TennisDiary;