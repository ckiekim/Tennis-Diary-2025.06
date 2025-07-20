import BottomNav from './BottomNav';
import TopRightCloseButton from './TopRightCloseButton';
import { Box } from '@mui/material';

export default function MainLayout({ children }) {
  return (
    // <>
    //   <Box sx={{ position: 'relative', p: 2, pb: '80px' }}>
    //     <TopRightCloseButton to="/" />
    //     {children}
    //   </Box>
    //   <BottomNav />
    // </>
    <>
      <Box sx={{ position: 'relative', minHeight: '100vh', p: 2, pb: 7 }}>
        {/* 고정된 닫기 버튼 */}
        <TopRightCloseButton />

        {/* 본문 내용 */}
        <Box sx={{ pt: 6 }}>
          {children}
        </Box>
      </Box>
      <BottomNav />
    </>
  );
}
