import { Avatar, Box, Divider, Typography } from '@mui/material';
import dayjs from 'dayjs';

const ClubHeader = ({ club }) => {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Avatar src={club.profileUrl || ''} alt={club.name} sx={{ width: 80, height: 80, mr: 2 }} />
        <Box>
          <Typography variant="h6" fontWeight="bold">{club.name}</Typography>
          <Typography variant="body2" color="text.secondary">{`${club.region} (${club.memberCount} 명)`}</Typography>
          <Typography variant="body2" color="text.secondary">
            클럽장: {club.ownerName} 
            {` (${club.createdAt ? dayjs(club.createdAt.toDate()).format('YYYY-MM-DD') : '날짜 정보 없음'} 생성)`}
          </Typography>
        </Box>
      </Box>
      {club.description && (
        <>
          <Typography variant="body2" fontWeight="bold">클럽 소개</Typography>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
            {club.description}
          </Typography>
          <Divider sx={{ my: 1 }} />
        </>
      )}
    </>
  );
};
export default ClubHeader;