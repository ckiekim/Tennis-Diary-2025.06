import React from 'react';
import {
  StaticDatePicker,
  PickersDay,
} from '@mui/x-date-pickers';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';
import { Box, Typography, IconButton } from '@mui/material';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import SportsBaseballIcon from '@mui/icons-material/SportsBaseball';

const KoreanCalendarHeader = ({ currentMonth, onMonthChange, previousMonth, nextMonth }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2, py: 1 }}>
      <IconButton onClick={() => onMonthChange(previousMonth)}>
        <ChevronLeft />
      </IconButton>
      <Typography variant="subtitle1" fontWeight="bold">
        {dayjs(currentMonth).locale('ko').format('YYYY.MM')}
      </Typography>
      <IconButton onClick={() => onMonthChange(nextMonth)}>
        <ChevronRight />
      </IconButton>
    </Box>
  );
};

// ✅ 일정 있는 날짜 리스트
const eventDates = ['2025-06-20', '2025-06-22', '2025-06-15'];

// ✅ 커스텀 PickersDay
const CustomPickersDay = (props) => {
  const { day, outsideCurrentMonth, ...other } = props;
  const formatted = dayjs(day).format('YYYY-MM-DD');
  const hasEvent = eventDates.includes(formatted);
  const isSunday = day.day() === 0;
  const isSaturday = day.day() === 6;

  return (
    <PickersDay
      {...other}
      day={day}
      outsideCurrentMonth={outsideCurrentMonth}
      sx={{
        position: 'relative',
        color: isSunday ? 'red' : isSaturday ? 'blue' : undefined,
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

const KoreanDatePicker = ({ value, onChange }) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="ko">
      <StaticDatePicker
        displayStaticWrapperAs="desktop"
        value={value}
        onChange={onChange}
        slots={{
          calendarHeader: KoreanCalendarHeader,
          day: CustomPickersDay, // 💡 핵심!
        }}
        slotProps={{
          actionBar: { actions: [] },
        }}
      />
    </LocalizationProvider>
  );
};

export default KoreanDatePicker;
