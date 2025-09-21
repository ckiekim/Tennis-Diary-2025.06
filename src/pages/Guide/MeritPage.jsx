import { Box, Typography, Link } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';
import StyleIcon from '@mui/icons-material/Style';

const MeritPage = () => {
  return (
    <GuideLayout>
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
            클럽 멤버들과 함께 활동하고 경기 결과를 공유하고 싶으신가요? <br />
            나의 실력 향상 그래프와 월별 지출 내역을 한눈에 확인하고 싶으신가요? <br />
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
            <strong>- 간편한 일정 및 결과 관리:</strong> 경기, 훈련 등 모든 스케줄을 손쉽게 등록하고 경기 스코어와 상세 내용을 기록하여 복기할 수 있습니다.<br />
            <strong>- 클럽 커뮤니티:</strong> 마음 맞는 사람들과 클럽을 만들어보세요. 클럽 전용 일정과 게시판을 통해 멤버들과 소통하며 함께 성장할 수 있습니다.<br />
            <strong>- 체계적인 비용 및 용품 관리:</strong> 라켓, 스트링 등 용품 구매 내역과 레슨, 게임비 등 모든 테니스 관련 지출을 기록하고 월별 현황을 분석할 수 있습니다.<br />
            <strong>- 데이터 기반 실력 분석:</strong> 저장된 기록을 바탕으로 종목별 전적과 월별 승률 변화 등 나의 성장 과정을 한눈에 확인할 수 있습니다.<br />
            <strong>- 사진으로 남기는 생생한 기록:</strong> 게임이나 대회의 기억하고 싶은 순간을 사진과 함께 기록하고 언제든지 다시 꺼내보세요.
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
    </GuideLayout>
  );
};

export default MeritPage;