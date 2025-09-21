import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const ExpenseGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          7. 비용 관리
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          '관리' 탭에서는 테니스 활동과 관련된 모든 비용을 월별로 모아보고, 상세한 지출 내역을 한눈에 파악할 수 있습니다.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- 1. 월별 비용 그래프 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 월별 비용 그래프
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          월별 총지출 현황을 누적 막대그래프로 보여줍니다. 각 막대는 '게임', '레슨', '대회', '정모', '용품' 등 항목별 비용이 각기 다른 색상으로 표시되어, 어떤 항목에 지출이 많았는지 직관적으로 파악할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/7-1.비용 관리1.jpg" alt="월별 비용 그래프" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 2. 상세 내역 표 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 상세 내역 표
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          그래프 하단에는 월별 상세 지출 내역이 표로 제공됩니다. 각 월마다 항목별로 얼마를 지출했는지 정확한 금액을 확인할 수 있으며, 지출이 가장 많았던 항목 순서대로 정렬되어 주요 지출 원인을 쉽게 분석할 수 있습니다. 표의 가장 아래에는 전체 기간의 항목별 누계와 총합계가 표시됩니다.
        </Typography><Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/7-2.비용 관리2.jpg" alt="월별 비용 그래프" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default ExpenseGuidePage;