import { useNavigate } from 'react-router-dom';
import useAuthState from '../../../hooks/useAuthState';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../../utils/formatDay';

export default function GameCard({ item }) {
  const navigate = useNavigate();
  const { user } = useAuthState();
  const day = formatDay(item.date);
  let displayPlace = '장소 정보 없음';
  if (item.placeInfo) {
    displayPlace = item.placeInfo.courtType === '실내'
      ? `${item.placeInfo.courtName} (실내)` : item.placeInfo.courtName;
  } else if (item.place) {
    displayPlace = item.place;
  }
  const photoUrl = item.placeInfo?.courtPhotoUrl || '/img/no-image.jpeg';

  const renderResult = () => {
    // '게임' 타입이고 결과가 1개만 있을 경우, 실제 결과를 표시
    if (item.type === '게임' && item.resultCount === 1 && item.result) {
      return (
        <Typography fontSize="12px" color="primary" fontWeight="bold">
          결과: {item.result}
        </Typography>
      );
    }

    // '정모'이고 결과가 여러 개이고 내 결과인 경우, 실제 결과와 입력 인원 수를 표시
    if (item.type === '정모' && item.resultCount >= 1 && item.uid === user?.uid) {
      if (item.resultCount === 1) {
        return (
          <Typography fontSize="12px" color="primary" fontWeight="bold">
            결과: {item.result}
          </Typography>
        );
      } else {
        return (
          <Typography fontSize="12px" color="primary" fontWeight="bold">
            결과: {item.result}, 타인 입력: {item.resultCount - 1}명
          </Typography>
        );
      }
    }
    
    // '정모'이고 결과가 여러 개인 경우, 입력 인원 수를 표시
    else if (item.resultCount >= 1) {
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
          component="img" src={photoUrl} alt="court"
          sx={{ width: 82, height: 82, objectFit: 'cover', borderRadius: 0, display: 'block', }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography fontSize="13px" fontWeight="bold" noWrap>
            {`${item.date} (${day}) ${item.time}`}
          </Typography>
          <Typography fontSize="12px">
            {displayPlace} 테니스코트
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

