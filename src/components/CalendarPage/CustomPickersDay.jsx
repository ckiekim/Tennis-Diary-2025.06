import { PickersDay } from '@mui/x-date-pickers';
import { Box } from '@mui/material';
import dayjs from 'dayjs';

export default function CustomPickersDay(props) {
  const { day, outsideCurrentMonth, selected, eventDateMap, ...other } = props;
  const formatted = dayjs(day).format('YYYY-MM-DD');
  const count = eventDateMap[formatted] || 0;
  const isSunday = day.day() === 0;

  return (
    <Box sx={{ position: 'relative' }}>
      <PickersDay
        {...other}
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{ position: 'relative', color: isSunday ? 'red' : undefined, }}
      />
      {count > 0 && !outsideCurrentMonth && (
        <Box
          sx={{
            display: 'flex', justifyContent: 'center',  position: 'absolute', bottom: 4, left: '50%',
            transform: 'translateX(-50%)', gap: '2px', zIndex: 2,
          }}
        >
          {[...Array(Math.min(count, 3))].map((_, idx) => (
            <Box
              key={idx}
              sx={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: 'green', }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};