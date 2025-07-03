import { Box, IconButton, Typography } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotesIcon from '@mui/icons-material/Notes';

export default function ScheduleCard({ schedule, onEdit, onDelete, onMemo }) {
  return (
    <Box
      key={schedule.id}
      sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 1, backgroundColor: '#f9f9f9', position: 'relative', }}
    >
      {/* 아이콘 버튼 영역 */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.25 }}>
        <IconButton size="small" onClick={() => onEdit(schedule)}>
          <EditIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onDelete(schedule.id)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={() => onMemo(schedule)}>
          <NotesIcon fontSize="small" />
        </IconButton>
      </Box>

      <Typography variant="subtitle2" fontWeight="bold">
        {schedule.type}
      </Typography>
      <Typography variant="body2">⏰ {schedule.start_time} - {schedule.end_time}</Typography>
      <Typography variant="body2">📍 {schedule.place} 테니스코트</Typography>
      {schedule.source && (
        <Typography variant="body2">📝 {schedule.source}</Typography>
      )}
      {schedule.result && (
        <Typography variant="body2">🎾 {schedule.result}</Typography>
      )}
      {schedule.price && (
        <Typography variant="body2">💰 {schedule.price.toLocaleString()}원</Typography>
      )}
    </Box>
  );
}
