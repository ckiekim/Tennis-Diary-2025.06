import { useNavigate } from 'react-router-dom';
import { Box, Card, Chip, Typography } from '@mui/material';

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
    <Card sx={{ mb: 0, p: 0 }} onClick={() => navigate(`/more/clubs/${club.id}`)}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={club.profileUrl || 'https://via.placeholder.com/70'} alt={club.clubName}
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
                height: '20px',          // 1. 높이를 원하는 크기로 직접 지정 (기본 small은 24px)
                fontSize: '0.65rem',      // 2. 폰트 크기를 더 작게 조절
                '.MuiChip-label': {      // 3. Chip 내부 라벨의 스타일을 직접 타겟팅
                  padding: '0 6px'     //    좌우 패딩을 줄여서 전체 너비를 좁힘
                }
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
            가입일: {club.joinDate}
          </Typography>
        </Box>
      </Box>
    </Card>
  );
};

export default ClubCard;