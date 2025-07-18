import BottomNav from './BottomNav';
import TopRightCloseButton from './TopRightCloseButton';
import { Box } from '@mui/material';

export default function MainLayout({ children }) {
  return (
    <>
      {/* <Box sx={{ p:2, pb:'80px' }}> */}
      <Box sx={{ position: 'relative', p: 2, pb: '80px' }}>
        <TopRightCloseButton to="/" />
        {children}
      </Box>
      <BottomNav />
    </>
  );
}
