import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../../utils/formatDay';

export default function TournamentCard({ item }) {
  const navigate = useNavigate();
  const day = formatDay(item.date);
  let logoSrc = '/img/no-image.jpeg';
  if (item.organizer === 'KATO') {
    logoSrc = '/img/KATO.png';
  } else if (item.organizer === 'KATA') {
    logoSrc = '/img/KATA.png';
  }

  return (
    <Card 
      sx={{ mb: 1, p: 0.5, cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
      onClick={() => navigate(`/result/tournament/${item.id}`)}
    >
      <Box sx={{ width: 80, mr: 1.5, display: 'flex', alignItems: 'center' }}>
        <Box
          component="img"
          src={logoSrc}
          alt={`${item.organizer} logo`}
          sx={{
            width: '100%',
            height: 'auto', // 기존 Aspect Ratio 유지를 위해 height는 auto로 설정
            objectFit: 'contain',
          }}
        />
      </Box>
      
      <Box sx={{ flex: 1 }}>
        <Typography fontSize="12px" color="text.secondary">
          {`${item.date} (${day})`}
        </Typography>
        <Typography fontSize="14px" fontWeight="bold">
          {item.name} {/* 대회명 */}
        </Typography>
        <Typography fontSize="12px">
          장소: {item.place} 테니스코트
        </Typography>
        <Box display="flex" gap={2}>
          <Typography fontSize="12px">
            종목: {item.category} {/* 참가종목 */}
          </Typography>
          {item.partner &&
            <Typography fontSize="12px">
              파트너: {item.partner}
            </Typography>
          }
        </Box>
        {item.result &&
          <Typography fontSize="12px" color="primary" fontWeight="bold">
            결과: {item.result}
          </Typography>
        }
      </Box>
    </Card>
  );
}