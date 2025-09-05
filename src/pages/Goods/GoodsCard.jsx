import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography } from '@mui/material';
import formatDay from '../../utils/formatDay';

export default function GoodsCard({ item }) {
  const navigate = useNavigate();
  const day = formatDay(item.date);

  const handleCardClick = () => {
    navigate(`/tools/goods/${item.id}`);
  };

  return (
    <Card 
      onClick={handleCardClick}
      sx={{  mb: 0,  p: 0,  cursor: 'pointer', '&:hover': { backgroundColor: '#f5f5f5' } }}
    >
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={item.photo || '/img/no-image.jpeg'} alt="goods"
          sx={{ width: 92, height: 92, objectFit: 'cover', borderRadius: 0, display: 'block', }}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0.8, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 0 }}>
          <Typography fontSize="13px" fontWeight="bold" 
            sx={{
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              overflow: 'hidden', textOverflow: 'ellipsis', mb: 0.5
            }}
          >
            {item.name}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontSize="12px">
              💰 {item.price.toLocaleString()}원
            </Typography>
            <Typography fontSize="12px">
              🛒 {item.shopper}
            </Typography>
          </Box>
          {item.memo && (
            <Box sx={{ display: 'flex', overflow: 'hidden' }}>
              <Typography fontSize="12px"
                sx={{
                  whiteSpace: 'nowrap',     // 줄바꿈 방지
                  overflow: 'hidden',       // 넘치는 내용 숨김
                  textOverflow: 'ellipsis', // 줄임표시(...)
                  flexShrink: 1, // 필요한 공간만 차지하도록 설정
                }}
              >
                📝 {item.memo}
              </Typography>
            </Box>
          )}
          <Typography fontSize="12px" sx={{ mt: 'auto' }}>
            📅 {`${item.date} (${day})`}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
}