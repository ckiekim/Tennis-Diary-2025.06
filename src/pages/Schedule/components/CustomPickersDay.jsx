import { PickersDay } from '@mui/x-date-pickers';
import { Box } from '@mui/material';
import typeColors from '../../../constants/typeColors';

export default function CustomPickersDay(props) {
  const { day, outsideCurrentMonth, selected, eventDateMap, holidays, eventTypes, ...other } = props;
  const ymd = day.format('YYYY-MM-DD');
  const dayOfWeek = day.day(); // 0: 일요일, 6: 토요일

  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isHoliday = holidays.some(h => h.date === ymd);

  const dayColor = () => {
    if (isSunday || isHoliday) return 'red';
    if (isSaturday) return 'blue';
    return undefined;
  };

  return (
    <Box sx={{ position: 'relative' }}>
      <PickersDay
        {...other}
        day={day}
        selected={selected}
        outsideCurrentMonth={outsideCurrentMonth}
        sx={{ position: 'relative', color: dayColor() }}
      />
      {eventTypes && eventTypes.length > 0 && !outsideCurrentMonth && (
        <Box
          sx={{
            display: 'flex', position: 'absolute', bottom: 4, left: '50%',
            transform: 'translateX(-50%)', gap: '2px', zIndex: 2,
          }}
        >
          {eventTypes.slice(0, 3).map((type, idx) => (
            <Box
              key={idx}
              sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: typeColors[type] || 'gray' }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};