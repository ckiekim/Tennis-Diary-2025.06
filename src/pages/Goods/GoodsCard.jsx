import { Box, Card, IconButton, Typography } from '@mui/material';
import formatDay from '../../utils/formatDay';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function GoodsCard({ item, onEdit, onDelete }) {
  const day = formatDay(item.date);

  return (
    <Card sx={{ mb: 0, p: 0 }}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={item.photo || '/img/no-image.jpeg'} alt="goods"
          sx={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 0, display: 'block', }}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography fontSize="13px" fontWeight="bold" 
              sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    overflow: 'hidden', textOverflow: 'ellipsis', }}
            >
              {item.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <IconButton onClick={() => onEdit(item)} size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton onClick={() => onDelete(item)} size="small">
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Typography fontSize="12px" color="text.secondary">
          💰 {item.price.toLocaleString()}원
          </Typography>
          <Typography fontSize="12px" color="text.secondary">
          🛒 {item.shopper}
          </Typography>
            <Typography fontSize="12px" color="text.secondary">📅 {`${item.date} (${day})`}</Typography>
        </Box>
      </Box>
    </Card>
  );
}
