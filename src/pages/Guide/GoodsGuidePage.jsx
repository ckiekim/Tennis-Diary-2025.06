import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const GoodsGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          6. 용품 관리
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          라켓, 신발, 의류, 스트링 교체 등 테니스와 관련된 모든 용품의 구매 내역을 기록하고 관리할 수 있습니다.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- 1. 용품 구매 목록 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 용품 구매 목록
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          '용품 구매' 화면은 내가 구매한 모든 용품의 목록을 보여줍니다. 새로운 용품을 등록하려면 화면 오른쪽 하단의 '+' 버튼을 사용하세요. 목록의 항목을 선택하면 상세 정보 페이지로 이동합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/6-1.용품 목록.jpg" alt="용품 구매 목록" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 2. 용품 상세 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 용품 상세
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          '용품 상세' 화면에서는 선택한 용품의 구매일, 구매처, 가격, 메모, 사진 등 모든 정보를 자세히 볼 수 있습니다. 하단의 '수정' 및 '삭제' 버튼으로 정보를 관리할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/6-2.용품 상세.jpg" alt="용품 상세 화면" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default GoodsGuidePage;