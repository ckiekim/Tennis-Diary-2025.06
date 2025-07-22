import { Box, Card, CardMedia, IconButton, Typography, } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CourtCard = ({ court, onEdit, onDelete }) => {
  return (
    <Card sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', position: 'relative', px: 1, py: 1, }}>
      {court.photo ? (
        <CardMedia
          component="img"
          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, }}
          image={court.photo}
          alt={court.name}
        />
      ) : (
        <Box sx={{ width: 60, height: 60, bgcolor: 'grey.300', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="caption">No Image</Typography>
        </Box>
      )}

      <Box sx={{ ml: 2, flexGrow: 1 }}>
        <Typography fontSize="13px" fontWeight="bold" noWrap>
          {court.name} 테니스코트
        </Typography>
        <Typography fontSize="12px" color="text.secondary">
          {court.location}
        </Typography>
        <Typography fontSize="12px" color="text.secondary">
          {court.surface}
          {court.is_indoor && ' / 실내'}
        </Typography>
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
