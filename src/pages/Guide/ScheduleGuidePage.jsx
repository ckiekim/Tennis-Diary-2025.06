import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';
import PostAddIcon from '@mui/icons-material/PostAdd';

const ScheduleGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          3. 일정 관리
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          테니스 다이어리의 핵심 기능인 일정 관리를 통해 모든 테니스 활동을 체계적으로 기록하고 확인할 수 있습니다.
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- 1. 일정 확인하기 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 일정 확인하기
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          앱의 메인 화면은 월별 달력 형식입니다. 일정이 등록된 날짜에는 색깔 점으로 표시되며, 날짜를 선택하면 하단에 상세 정보가 나타납니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/3-1.일정 달력.jpg" alt="월별 달력 화면" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 2. 일정 추가하기 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 일정 추가하기
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          달력 화면 오른쪽 아래의 '+' 버튼을 누르면 '일정 추가' 창이 나타납니다. '종류'를 선택하면 해당 활동에 맞는 입력 화면으로 변경됩니다.
        </Typography>
        
        {/* 게임 */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>- 게임</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          시간, 장소, 비용, 소스(오픈톡, 카페 등)를 입력하여 간단한 게임 일정을 등록합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/3-2.일정 추가_게임.jpg" alt="게임 일정 추가" style={{ width: '100%', maxWidth: '300px' }} />
        </Box> 

        {/* 레슨 및 정모 */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>- 레슨 및 정모</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          '레슨'이나 '정모'는 반복되는 경우가 많아 '반복 일정' 기능을 제공합니다. 반복 주기, 요일, 시간, 월 비용, 종료일을 설정하여 한 번에 등록할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/3-3.일정 추가_레슨.jpg" alt="레슨 일정 추가" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        {/* 대회 */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>- 대회</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          대회명, 장소, 참가 종목, 파트너, 주관, 참가비 등 대회와 관련된 상세 정보를 입력합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/3-4.일정 추가_대회.jpg" alt="대회 일정 추가" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
		
        {/* 결과 입력 */}
        <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>- 결과 입력</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          일정에서 마지막 아이콘
		  <PostAddIcon fontSize="small" />
		  을 누르면 완료된 게임과 대회에 대해 상세한 결과,
		  간단한 메모와 함께 사진을 업로드하여 그날의 경기를 더 생생하게 기록할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/3-5.결과 입력.jpg" alt="대회 일정 추가" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default ScheduleGuidePage;