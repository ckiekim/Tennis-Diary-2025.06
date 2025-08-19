import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import TollIcon from '@mui/icons-material/Toll';

const MileageInfoPage = () => {
  return (
    <MainLayout title='마일리지 안내'>
      <Box sx={{ p: 2 }}>
        <Box sx={{ display:'flex', alignItems:'center', mb: 1 }}>
          <TollIcon sx={{ mr: 1 }} />
          <Typography variant="h6">
            마일리지 안내
          </Typography>
        </Box>
        <List>
          <ListItem disablePadding>
            <ListItemText primary="- 프로필 설정: 100 point" />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="- 일정 등록: 5 point" />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="- 결과 등록: 5 point" />
          </ListItem>
          <ListItem disablePadding>
            <ListItemText primary="- 용품 등록: 10 point" />
          </ListItem>
        </List>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          - 등록한 일정, 용품 등을 삭제하면 지급된 마일리지는 삭제됨
        </Typography>
      </Box>
    </MainLayout>
  );
};

export default MileageInfoPage;