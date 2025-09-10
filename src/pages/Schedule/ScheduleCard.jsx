import { Box, IconButton, Typography } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotesIcon from '@mui/icons-material/Notes';

export default function ScheduleCard({ schedule, onEdit, onDelete, onResult }) {
  const isLesson = schedule.type === "레슨";
  const isTournament = schedule.type === "대회";
  const isJeongmo = schedule.type === "정모";
  const isRecurring = schedule?.isRecurring;

  return (
    <Box
      key={schedule.id}
      sx={{ border: '1px solid #ccc', borderRadius: 2, p: 2, mb: 1, backgroundColor: '#f9f9f9', position: 'relative', }}
    >
      {/* 아이콘 버튼 영역 */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.25 }}>
        { onEdit && (
          <IconButton size="small" onClick={() => onEdit(schedule)}>
            <EditIcon fontSize="small" />
          </IconButton>
        )}
        { onDelete && (
          <IconButton size="small" onClick={() => onDelete(schedule)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
        { !isLesson && (
          <IconButton size="small" onClick={() => onResult(schedule)}>
            <NotesIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Typography variant="subtitle2" fontWeight="bold">
        {schedule.type}
      </Typography>
      { isJeongmo ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>🧑‍🤝‍🧑</Box>
            <Typography variant="body2">{schedule.club.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>⏰</Box>
            <Typography variant="body2">{schedule.time}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📍</Box>
            <Typography variant="body2">{schedule.place} 테니스코트</Typography>
          </Box>
        </>
      ) : isTournament ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>🏆</Box>
            <Typography variant="body2" fontWeight="bold">{schedule.name}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>🎾</Box>
            <Typography variant="body2">{`${schedule.category} / ${schedule.organizer} ${schedule.division}`}</Typography>
          </Box>
           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📍</Box>
            <Typography variant="body2">{schedule.place} 테니스코트</Typography>
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>⏰</Box>
            <Typography variant="body2">{schedule.time}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📍</Box>
            <Typography variant="body2">{schedule.place} 테니스코트</Typography>
          </Box>
        </>
      )}
      {schedule.source && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📝</Box>
          <Typography variant="body2">{schedule.source}</Typography>
        </Box>
      )}
      {schedule.price && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>💰</Box>
          <Typography variant="body2">
            {schedule.price.toLocaleString()}
            {(isLesson && isRecurring) ? '원/월' : '원'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
