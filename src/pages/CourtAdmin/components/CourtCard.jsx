import { Box, Card, CardMedia, IconButton, Typography, } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CourtCard = ({ court, onEdit, onDelete }) => {
  const representativePhoto = court.details?.[0]?.photo || court.photo || '/img/no-image.jpeg';

  return (
    <Card sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', position: 'relative', p: 0 }}>
      <CardMedia
        component="img"
        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, }}
        image={representativePhoto}
        alt={court.name}
      />

      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <Typography fontSize="13px" fontWeight="bold" noWrap>
          {court.name} 테니스코트
        </Typography>
        <Typography fontSize="12px" color="text.secondary">
          {court.location}
        </Typography>
        {court.details && court.details.length > 0 && (
          <Box sx={{ display: 'flex', gap: 3, mt: 0.1 }}> {/* gap을 이용해 간격 조절 */}
            {court.details.map(detail => (
              <Typography key={detail.type} fontSize="11px" color="text.secondary">
                - {detail.type} / {detail.surface}
              </Typography>
            ))}
          </Box>
        )}
      </Box>

      {/* 아이콘 영역 */}
      <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
        <IconButton size="small" onClick={onEdit}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={onDelete}>
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Box>
    </Card>
  );
}

export default CourtCard;
