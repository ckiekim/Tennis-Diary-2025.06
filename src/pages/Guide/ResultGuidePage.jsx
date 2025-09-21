import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const ResultGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          4. 게임 결과
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          '결과' 탭에서는 '일정'에 등록했던 게임과 대회의 결과를 모아보고, 나의 전적을 통계로 확인할 수 있습니다. 
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- 1. 게임 결과 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 게임 결과
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          기록된 모든 게임의 목록을 최신순으로 확인하고, 상세 페이지에서 결과, 메모, 사진 등 모든 정보를 자세히 볼 수 있습니다. 
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/4-1.게임 결과 목록.jpg" alt="게임결과 목록" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/4-2.게임 결과 상세.jpg" alt="게임결과 상세" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 2. 대회 결과 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 대회 결과
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          참가했던 대회의 목록과 각 대회의 상세 정보를 확인할 수 있습니다. 대회명, 장소, 참가 정보, 최종 결과, 참가비, 사진 등 종합적인 정보를 관리합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/4-3.대회 결과 목록.jpg" alt="대회결과 목록" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/4-4.대회 결과 상세.jpg" alt="대회결과 상세" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 3. 게임 통계 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ③ 게임 통계
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          저장된 게임 기록을 바탕으로 다양한 분석 데이터를 제공합니다. 종목별 전체 승/무/패 전적을 막대그래프로, 월별 승률 변화 추이를 꺾은선 그래프로 확인할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/4-5.게임 통계.jpg" alt="게임 통계" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default ResultGuidePage;