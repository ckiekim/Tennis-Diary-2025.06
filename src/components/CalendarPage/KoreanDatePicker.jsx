import React, { useState } from 'react';
import { StaticDatePicker } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Box, IconButton, Typography } from '@mui/material';
import CustomPickersDay from './CustomPickersDay';

import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';

// 🗓 커스텀 헤더
const KoreanCalendarHeader = ({ currentMonth, onMonthChange }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
      <IconButton onClick={() => onMonthChange(dayjs(currentMonth).subtract(1, 'month'))}>
        <ChevronLeft />
      </IconButton>
      <Typography variant="subtitle1" fontWeight="bold">
        {dayjs(currentMonth).locale('ko').format('YYYY.MM')}
      </Typography>
      <IconButton onClick={() => onMonthChange(dayjs(currentMonth).add(1, 'month'))}>
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

// 🧩 KoreanDatePicker 본체
const KoreanDatePicker = ({ value, onChange, eventDateMap }) => {
  const [displayMonth, setDisplayMonth] = useState(value);

  // ✅ 월 변경 시 날짜도 새 달의 첫날로 바꿔줌
  const handleMonthChange = (newMonth) => {
    const firstDayOfMonth = newMonth.startOf('month');
    setDisplayMonth(firstDayOfMonth);
    onChange(firstDayOfMonth);
  };

  // ✅ 날짜 선택 시 부모에 전달
  const handleDateChange = (newValue) => {
    onChange(newValue);
    setDisplayMonth(newValue);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <StaticDatePicker
        value={displayMonth}
        onChange={handleDateChange}
        slots={{
          toolbar: () => null,
          calendarHeader: (props) => (
            <KoreanCalendarHeader
              {...props}
              currentMonth={displayMonth}
              onMonthChange={handleMonthChange}
            />
          ),
          day: (props) => <CustomPickersDay {...props} eventDateMap={eventDateMap} />,
        }}
        slotProps={{
          actionBar: { actions: [] },
        }}
      />
    </LocalizationProvider>
  );
};

export default KoreanDatePicker;
