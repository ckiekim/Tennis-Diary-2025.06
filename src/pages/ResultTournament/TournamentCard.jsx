import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../utils/formatDay';

export default function TournamentCard({ item }) {
  const navigate = useNavigate();
  const day = formatDay(item.date);

  return (
    // 클릭 시 상세 페이지로 이동하는 기능은 그대로 유지합니다.
    <Card sx={{ mb: 1, p: 1.5, cursor: 'pointer' }} onClick={() => navigate(`/result/tournament/${item.id}`)}>
      <Typography fontSize="13px" color="text.secondary">
        {`${item.date} (${day})`}
      </Typography>
      <Typography fontSize="16px" fontWeight="bold" mt={0.5}>
        {item.name} {/* 대회명 */}
      </Typography>
      <Typography fontSize="14px" mt={0.5}>
        장소: {item.place} 테니스코트
      </Typography>
      <Box display="flex" mt={0.5} gap={2}>
        <Typography fontSize="14px">
          종목: {item.category} {/* 참가종목 */}
        </Typography>
        {item.partner &&
          <Typography fontSize="14px">
            파트너: {item.partner}
          </Typography>
        }
      </Box>
      {item.result &&
        <Typography fontSize="14px" color="primary" fontWeight="bold" mt={0.5}>
          결과: {item.result}
        </Typography>
      }
    </Card>
  );
}