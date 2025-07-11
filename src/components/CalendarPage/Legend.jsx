import { Box, Typography } from '@mui/material';

import typeColors from '../../utils/typeColors';

export default function Legend() {
  return (
    <Box
      sx={{
        display: 'flex', flexWrap: 'wrap', gap: 1.5, justifyContent: 'center', alignItems: 'center',
        mb: 3, mt: -3
      }}
    >
      {Object.entries(typeColors).map(([label, color]) => (
        <Box
          key={label}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: color }}/>
          <Typography variant="caption">{label}</Typography>
        </Box>
      ))}
    </Box>
  );
}
