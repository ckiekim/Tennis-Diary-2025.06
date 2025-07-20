import { Card, Box, Typography } from '@mui/material';
import formatDay from '../../utils/formatDay';

export default function GoodsCard({ item }) {
  const day = formatDay(item.date);
  return (
    <Card sx={{ mb: 0, p: 0 }}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={item.photo} alt="goods"
          sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 0, display: 'block', }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography fontSize="13px" fontWeight="bold" 
            sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  overflow: 'hidden', textOverflow: 'ellipsis', }}
          >
            {item.name}
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
          💰 {item.price.toLocaleString()}원
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
          🛒 {item.shopper}
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
          📅 {`${item.date} (${day})`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}
