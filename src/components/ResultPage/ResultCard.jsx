import { Card, Box, Typography } from '@mui/material';

export default function ResultCard({ item }) {
  const day = formatDay(item.date);
  return (
    <Card sx={{ mb:2 }}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        {/* ✅ 이미지 영역 */}
        <Box sx={{ width: 80, aspectRatio: '1 / 1', flexShrink: 0, display: 'flex', alignItems: 'center', }}>
          <Box
            component="img" src={item.photo} alt="court"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, }}
            onError={(e) => (e.target.style.display = 'none')}
          />
        </Box>

        {/* ✅ 텍스트 영역 */}
        <Box sx={{ flex:1, px:1.2, py:1, display:'flex', flexDirection:'column', justifyContent:'center' }}>
          <Typography fontSize="13px" fontWeight="bold" noWrap>
            {`${item.date} (${day}) ${item.start_time}~${item.end_time}`}
          </Typography>
          <Typography fontSize="12px">{item.place} 테니스코트</Typography>
          <Typography fontSize="12px">결과: {item.result}</Typography>
          {item.source && 
            <Typography fontSize="12px">소스: {item.source}</Typography>
          }
        </Box>
      </Box>
    </Card>
  );
}

const formatDay = (dateStr) => {
  const date = new Date(dateStr);
  const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return day;
};
