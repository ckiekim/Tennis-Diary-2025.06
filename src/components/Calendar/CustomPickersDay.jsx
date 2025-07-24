import { PickersDay } from '@mui/x-date-pickers';
import { Box } from '@mui/material';
import typeColors from '../../utils/typeColors';

export default function CustomPickersDay(props) {
  const { day, outsideCurrentMonth, selected, eventDateMap, eventTypes, ...other } = props;
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