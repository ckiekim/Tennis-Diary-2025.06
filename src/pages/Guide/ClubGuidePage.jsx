import { Box, Divider, Typography } from '@mui/material';
import GuideLayout from '../../components/GuideLayout';

const ClubGuidePage = () => {
  return (
    <GuideLayout title='테니스 다이어리'>
      <Box sx={{ p: 1, pb: 4 }}>
        <Typography variant="h5" gutterBottom>
          5. 클럽
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          클럽 기능을 통해 다른 사용자들과 팀을 이루어 활동하고, 클럽만의 일정과 게시판을 통해 소통할 수 있습니다. 
        </Typography>

        <Divider sx={{ my: 2 }} />

        {/* --- 1. 클럽 생성 및 가입 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ① 클럽 생성 및 가입
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          '클럽' 탭에서 현재 활동 중인 클럽 목록을 확인하거나, 화면 오른쪽 아래의 '+' 버튼을 눌러 새로운 클럽을 직접 만들 수 있습니다. 클럽 가입은 기존 운영진의 초대를 통해서만 가능하며, 초대를 받으면 알림을 통해 가입 여부를 결정할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-1.클럽 목록.jpg" alt="클럽 목록" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-2.클럽 생성.jpg" alt="새 클럽 만들기" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-3.클럽 초대.jpg" alt="클럽멤버 초대" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
		<Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-4.클럽 초대 수락.jpg" alt="클럽멤버 초대 수락" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        
        <Divider sx={{ my: 2 }} />

        {/* --- 2. 클럽 상세 화면 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ② 클럽 상세 화면
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          클럽 상세 화면은 멤버 목록, 클럽 일정, 게시판으로 구성되어 클럽의 모든 활동을 한눈에 볼 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-5.클럽 상세.jpg" alt="클럽 상세 화면" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* --- 3. 클럽 활동하기 --- */}
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          ③ 클럽 활동하기
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          클럽 멤버라면 누구나 새로운 정모 일정을 등록할 수 있으며, 게시판에 글을 작성하고 댓글과 좋아요 기능으로 멤버들과 교감할 수 있습니다.
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-6.클럽 일정.jpg" alt="클럽 일정 추가" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <img src="/guide/5-7.클럽 게시글.jpg" alt="클럽 게시글 작성" style={{ width: '100%', maxWidth: '300px' }} />
        </Box>
      </Box>
    </GuideLayout>
  );
};

export default ClubGuidePage;