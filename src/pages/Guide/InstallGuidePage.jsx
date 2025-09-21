import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const InstallGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          1. 앱 설치하기 (PWA)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          테니스 다이어리는 별도의 앱 스토어를 통하지 않고, 웹 브라우저에서 바로 설치하여 일반 앱처럼 사용하실 수 있습니다. 이를 PWA(Progressive Web App) 방식이라고 합니다.
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          🤖 Android (Chrome 브라우저)
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          1. 스마트폰에서 Chrome 브라우저를 열고 주소창에 <strong>tennis-diary.kr</strong> 을 입력하여 접속합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/1-1.접속.jpg" alt="웹사이트 접속" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        
        <Typography variant="body1" sx={{ mb: 2 }}>
          2. 브라우저의 오른쪽 위 '더보기(⋮)' 메뉴를 누른 후, <strong>'홈 화면에 추가'</strong>를 선택합니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/1-2.앱 설치1.jpg" alt="홈 화면에 추가 메뉴" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          3. '설치' 버튼을 누릅니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/1-3.앱 설치2.jpg" alt="설치 버튼" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Typography variant="body1" sx={{ mb: 2 }}>
          4. 설치가 완료되면 스마트폰 홈 화면에 테니스 다이어리 아이콘이 생성됩니다. 이제 아이콘을 눌러 간편하게 접속할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/1-4.앱 설치 결과.jpg" alt="홈 화면 아이콘" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>

      <Divider sx={{ my: 2 }} />
      {/* 2. 아이폰 / 아이패드 설치 안내 */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          📱 iPhone / iPad (Safari 브라우저)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          1. Safari 브라우저를 열고 <strong>www.tennis-diary.kr</strong> 사이트로 이동합니다. <br />
          2. 하단 메뉴 바에서 공유 아이콘(상자 위로 화살표가 나가는 모양)을 누릅니다. <br />
          3. 나타나는 메뉴에서 아래로 스크롤하여 '홈 화면에 추가'를 선택합니다. <br />
          4. 앱의 이름('Tennis Diary')을 확인하고, 우측 상단의 '추가' 버튼을 누릅니다. <br />
          5. 이제 홈 화면에 추가된 Tennis Diary 아이콘을 진짜 앱처럼 사용할 수 있습니다.
        </Typography>
      </Box>

      <Divider sx={{ my: 2 }} />
      {/* 3. PC 설치 안내 */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          💻 PC (Chrome, Edge 브라우저)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          1. Chrome 또는 Edge 브라우저를 열고 <strong>www.tennis-diary.kr</strong> 사이트로 이동합니다. <br />
          2. 주소창 오른쪽 끝에 나타나는 설치 아이콘(컴퓨터와 아래쪽 화살표 모양)을 클릭합니다. <br />
          3. 나타나는 팝업에서 '설치' 버튼을 누릅니다. <br />
          4. 이제 Tennis Diary가 별도의 창으로 실행되며, 작업 표시줄에 고정하여 언제든지 빠르게 실행할 수 있습니다.
        </Typography>
      </Box>
    </GuideLayout>
  );
};

export default InstallGuidePage;
