import React, { useState, useEffect } from 'react';
import { StaticDatePicker, PickersDay } from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Box, IconButton, Typography } from '@mui/material';

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

// 🎾 커스텀 PickersDay 컴포넌트
const CustomPickersDay = (props) => {
  const { day, outsideCurrentMonth, selected, eventDates, ...other } = props;
  const formatted = dayjs(day).format('YYYY-MM-DD');
  const hasEvent = eventDates.includes(formatted);
  const isSunday = day.day() === 0;

  return (
    <PickersDay
      {...other}
      day={day}
      selected={selected}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={{
        position: 'relative',
        color: isSunday ? 'red' : undefined,
        '&::after': hasEvent
          ? {
              content: '""',
              position: 'absolute',
              bottom: 4,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: 'green',
            }
          : {},
      }}
    />
  );
};

// 🧩 KoreanDatePicker 본체
const KoreanDatePicker = ({ value, onChange, eventDates }) => {
  const [displayMonth, setDisplayMonth] = useState(value);

  // ✅ 월 변경 시 날짜도 새 달의 첫날로 바꿔줌
  const handleMonthChange = (newMonth) => {
    const newDate = newMonth.startOf('month');
    setDisplayMonth(newDate);
  };

  // ✅ 날짜 선택 시 부모에 전달
  const handleDateChange = (newValue) => {
    onChange(newValue);
    setDisplayMonth(newValue);
  };

  // 📌 day 슬롯으로 전달할 컴포넌트
  const DayWithEvent = (props) => (
    <CustomPickersDay {...props} eventDates={eventDates} />
  );

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
          day: DayWithEvent,
        }}
        slotProps={{
          actionBar: { actions: [] },
        }}
      />
    </LocalizationProvider>
  );
};

export default KoreanDatePicker;
