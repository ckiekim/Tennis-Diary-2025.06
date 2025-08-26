import { Box, Link, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const AppInfoPage = () => {
  return (
    <MainLayout title="테니스 다이어리">
      <Box sx={{ display:'flex', alignItems:'center', mb: 1, p: 2 }}>
        <InfoOutlinedIcon sx={{ mr: 1 }} />
        <Typography variant="h6">
          앱 정보
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '600px',
          textAlign: 'center',
          padding: 3
        }}
      >
        <img
          src="/img/logo.png" alt="Tennis Diary 로고"
          style={{ width: 250, height: 250, marginBottom: 24, }}
        />
        <Typography variant="body1" sx={{ mb: 1 }}>
          버전 1.0.0
        </Typography>
        <img 
          src="/img/ck-logo.png" alt="ck world 로고"
          style={{ height: 40, marginTop: 10, marginBottom: 10 }} 
        />
        <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
          문의 및 제휴
        </Typography>
        <Link 
          href="mailto:ckiekim@naver.com" 
          variant="body2"
          sx={{ mb: 2 }}
        >
          ckiekim@naver.com
        </Link>
        <Typography variant="caption" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>
          © 2025 CK World. All Rights Reserved.
        </Typography>
      </Box>
    </MainLayout>
  );
};

export default AppInfoPage;