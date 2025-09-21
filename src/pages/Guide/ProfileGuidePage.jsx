import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const ProfileGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          2. 가입 및 초기 프로필 설정
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          테니스 다이어리는 별도의 회원가입 절차 없이 사용하고 계신 소셜 계정(구글, 카카오)을 통해 간편하게 시작할 수 있습니다. 최초 로그인 시, 서비스 이용을 위한 간단한 프로필 설정이 필요합니다.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 소셜 계정으로 시작하기
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          로그인 화면에서 구글 또는 카카오 계정을 선택하여 바로 시작할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/2-1.가입 및 로그인.jpg" alt="소셜 로그인 화면" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 프로필 정보 입력하기
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          최초 로그인 시, 활동에 필요한 초기 프로필을 설정하는 화면으로 이동합니다. 프로필 사진, 닉네임, 그리고 주로 활동하는 지역 정보를 입력해 주세요. 프로필 설정이 완료되면 모든 기능을 자유롭게 이용할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/2-2.프로필 설정.jpg" alt="프로필 설정 화면" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default ProfileGuidePage;