import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../../utils/formatDay';

export default function GameCard({ item }) {
  const navigate = useNavigate();
  const day = formatDay(item.date);

  const renderResult = () => {
    // '게임' 타입이고 결과가 1개만 있을 경우, 실제 결과를 표시
    if (item.type === '게임' && item.resultCount === 1 && item.result) {
      return (
        <Typography fontSize="12px" color="primary" fontWeight="bold">
          결과: {item.result}
        </Typography>
      );
    }
    
    // '정모'이거나 결과가 여러 개/0개인 경우, 입력 인원 수를 표시
    if (item.resultCount > 0) {
      return (
        <Typography fontSize="12px" color="primary" fontWeight="bold">
          결과 입력: {item.resultCount}명
        </Typography>
      );
    }

    // 결과가 아예 없는 경우
    return (
      <Typography fontSize="12px" color="text.secondary">
        결과 미입력
      </Typography>
    );
  };


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
          {renderResult()}
          {item.source && 
            <Typography fontSize="12px">
              소스: {item.source}
            </Typography>
          }
          {item.club && 
            <Typography fontSize="12px">
              정모: {item.club?.name || item.club}
            </Typography>
          }
        </Box>
      </Box>
    </Card>
  );
}

