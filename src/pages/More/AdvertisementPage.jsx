import { Box, Typography, Link } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import StyleIcon from '@mui/icons-material/Style';

const AdvertisementPage = () => {
  return (
    <MainLayout title="테니스 다이어리">
      <Box sx={{ p: 1, pb: 4 }}>
        {/* 로고 및 메인 슬로건 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            mb: 2,
          }}
        >
          <img
            src="/img/logo.png" alt="Tennis Diary 로고"
            style={{ width: 140, height: 140, marginBottom: 2 }}
          />
          <Typography variant="subtitle1" fontWeight="bold">
            나만의 테니스 기록, 테니스 다이어리!
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography fontSize="12px" color="text.secondary" align="center">
            테니스 스케줄을 관리하고 싶으신가요? <br />
            지난 경기에서 어떤 용품을 사용했는지, 경기장의 생생한 순간을 기록하고 싶으신가요? <br />
            나의 실력 향상 그래프를 한눈에 확인하고 싶으신가요? <br />
            이제 이 모든 것을 테니스 다이어리 하나로 해결하세요!
          </Typography>
        </Box>

        {/* 주요 기능 */}
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <StyleIcon sx={{ mr: 1, fontSize: 18 }} />
            <Typography fontSize="14px" fontWeight="bold">주요 기능</Typography>
          </Box>
          <Typography fontSize="12px" color="text.secondary">
            <strong>- 간편한 일정 및 결과 관리:</strong> 경기, 훈련 등 모든 스케줄을 손쉽게 등록하고 파트너와 공유하세요. 경기 스코어와 상세 내용을 기록하여 복기할 수 있습니다.<br />
            <strong>- 사진으로 남기는 생생한 기록:</strong> 게임이나 대회의 기억하고 싶은 순간을 사진과 함께 기록하고 언제든지 다시 꺼내보세요.<br />
            <strong>- 체계적인 용품 관리:</strong> 라켓, 스트링, 신발 등 나만의 용품 정보를 등록하고 사용 내역을 추적하여 최적의 장비 조합을 찾을 수 있습니다.<br />
            <strong>- 데이터 기반 실력 분석:</strong> 저장된 기록을 바탕으로 나의 테니스 활동을 분석하고 성장 과정을 한눈에 확인할 수 있습니다.
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Typography fontSize="12px" align="center" fontWeight="bold">
            이제 테니스 다이어리와 함께 더욱 스마트하고 즐거운 <br />
            테니스 라이프를 시작해보세요!
          </Typography>
          <Typography fontSize="12px" sx={{ mt: 1 }}>
            👉 지금 바로 접속: <Link href="https://tennis-diary.kr">tennis-diary.kr</Link>
          </Typography>
        </Box>

      </Box>
    </MainLayout>
  );
};

export default AdvertisementPage;