import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../utils/formatDay';

export default function GameCard({ item }) {
  const navigate = useNavigate();
  const day = formatDay(item.date);

  return (
    <Card sx={{ mb: 0, p: 0 }} onClick={() => navigate(`/result/game/${item.id}`)}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={item.photo || '/img/no-image.jpeg'} alt="court"
          sx={{ width: 82, height: 82, objectFit: 'cover', borderRadius: 0, display: 'block', }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography fontSize="13px" fontWeight="bold" noWrap>
            {`${item.date} (${day}) ${item.time}`}
          </Typography>
          <Typography fontSize="12px">
            {item.place} 테니스코트
          </Typography>
          <Typography fontSize="12px">
            결과: {item.result}
          </Typography>
          {item.source && 
            <Typography fontSize="12px">
              소스: {item.source}
            </Typography>
          }
          {item.club && 
            <Typography fontSize="12px">
              정모: {item.club}
            </Typography>
          }
        </Box>
      </Box>
    </Card>
  );
}

