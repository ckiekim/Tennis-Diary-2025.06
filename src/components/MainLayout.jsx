import BottomNav from './BottomNav';
import { Box } from '@mui/material';

export default function MainLayout({ children }) {
  return (
    <>
      <Box sx={{ p:2, pb:'80px' }}>{children}</Box>
      <BottomNav />
    </>
  );
}
