import { useNavigate } from 'react-router-dom';
import { Box, Card, Chip, Typography } from '@mui/material';
import dayjs from 'dayjs';

/**
 * 내가 가입한 클럽의 정보를 표시하는 카드 컴포넌트 (MUI only)
 * @param {object} props
 * @param {object} props.club - 클럽 데이터 객체 (id, clubName, profileUrl, region, role 등)
 */
const ClubCard = ({ club }) => {
  const navigate = useNavigate();
  const getRoleChipProps = (role) => {
    switch (role) {
      case 'owner':
        return { label: '클럽장', color: 'primary' };
      case 'admin':
        return { label: '관리자', color: 'warning' };
      default:
        return { label: '멤버', color: 'default' };
    }
  };

  return (
    <Card sx={{ mb: 0, p: 0 }} onClick={() => navigate(`/clubs/${club.id}`)}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={club.clubProfileUrl  || 'https://via.placeholder.com/70'} alt={club.clubName}
          sx={{ width: 82, height: 82, objectFit: 'cover', borderRadius: 0, display: 'block', }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography fontSize="13px" fontWeight="bold" noWrap sx={{ mr: 1 }}>
              {club.clubName}
            </Typography>
            <Chip {...getRoleChipProps(club.role)} 
              size="small" 
              sx={{ 
                height: '20px',           // 기본 small은 24px
                fontSize: '0.65rem',      // 폰트 크기를 더 작게 조절
                '.MuiChip-label': { padding: '0 6px' }
              }}
            />
          </Box>
          <Typography fontSize="12px">
            활동지역: {club.region}
          </Typography>
          <Typography fontSize="12px">
            클럽장: {club.ownerName}
          </Typography>
          <Typography fontSize="12px">
            가입일: {
              (club.joinedAt && club.joinedAt.toDate) ? dayjs(club.joinedAt.toDate()).format('YYYY-MM-DD') : '처리 중...'
            }
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default ClubCard;