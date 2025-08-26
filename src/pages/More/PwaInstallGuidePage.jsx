import { Box, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import DownloadForOfflineIcon from '@mui/icons-material/DownloadForOffline';

const PwaInstallGuidePage = () => {
  return (
    <MainLayout title='테니스 다이어리'>
      <Box sx={{ p: 2, pb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <DownloadForOfflineIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            PWA 앱 설치 안내
          </Typography>
        </Box>

        {/* 안내 문구 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="body2" color="text.secondary">
            테니스 다이어리를 앱 스토어에서 다운로드하는 번거로움 없이, 지금 바로 당신의 스마트폰과 PC에 앱처럼 설치하여 빠르고 편리하게 사용해 보세요! PWA(Progressive Web App) 기술을 통해 항상 최신 버전을 유지하며 기기 저장 공간을 거의 차지하지 않습니다.
          </Typography>
        </Box>

        {/* 1. 안드로이드 설치 안내 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">🤖 Android (Chrome 브라우저)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. Chrome 브라우저를 열고 <strong>www.tennis-diary.kr</strong> 사이트로 이동합니다. <br />
            2. 화면에 'Tennis Diary 앱을 설치하시겠습니까?' 라는 팝업이 나타나면 '설치' 버튼을 누릅니다. <br />
            3. 만약 팝업이 나타나지 않는다면, 우측 상단의 더보기 메뉴(점 3개 아이콘)를 누릅니다. <br />
            4. 나타나는 메뉴에서 '앱 설치' 또는 '홈 화면에 추가'를 선택합니다. <br />
            5. 이제 홈 화면에 추가된 Tennis Diary 아이콘으로 바로 접속할 수 있습니다.
          </Typography>
        </Box>

        {/* 2. 아이폰 / 아이패드 설치 안내 */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="bold">📱 iPhone / iPad (Safari 브라우저)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. Safari 브라우저를 열고 <strong>www.tennis-diary.kr</strong> 사이트로 이동합니다. <br />
            2. 하단 메뉴 바에서 공유 아이콘(상자 위로 화살표가 나가는 모양)을 누릅니다. <br />
            3. 나타나는 메뉴에서 아래로 스크롤하여 '홈 화면에 추가'를 선택합니다. <br />
            4. 앱의 이름('Tennis Diary')을 확인하고, 우측 상단의 '추가' 버튼을 누릅니다. <br />
            5. 이제 홈 화면에 추가된 Tennis Diary 아이콘을 진짜 앱처럼 사용할 수 있습니다.
          </Typography>
        </Box>

        {/* 3. PC 설치 안내 */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight="bold">💻 PC (Chrome, Edge 브라우저)</Typography>
          <Typography variant="body2" color="text.secondary">
            1. Chrome 또는 Edge 브라우저를 열고 <strong>www.tennis-diary.kr</strong> 사이트로 이동합니다. <br />
            2. 주소창 오른쪽 끝에 나타나는 설치 아이콘(컴퓨터와 아래쪽 화살표 모양)을 클릭합니다. <br />
            3. 나타나는 팝업에서 '설치' 버튼을 누릅니다. <br />
            4. 이제 Tennis Diary가 별도의 창으로 실행되며, 작업 표시줄에 고정하여 언제든지 빠르게 실행할 수 있습니다.
          </Typography>
        </Box>

      </Box>
    </MainLayout>
  );
};

export default PwaInstallGuidePage;
