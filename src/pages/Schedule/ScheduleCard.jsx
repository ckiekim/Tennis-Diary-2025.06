import { Box, IconButton, Typography } from '@mui/material';

import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NotesIcon from '@mui/icons-material/Notes';

export default function ScheduleCard({ schedule, onEdit, onDelete, onResult }) {
  const isStringReplace = schedule.type === "스트링 교체";
  const isLesson = schedule.type === "레슨";
  const isTournament = schedule.type === "대회";

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
        <IconButton size="small" onClick={() => onDelete(schedule)}>
          <DeleteIcon fontSize="small" />
        </IconButton>
        { ! (isStringReplace || isLesson) && (
          <IconButton size="small" onClick={() => onResult(schedule)}>
            <NotesIcon fontSize="small" />
          </IconButton>
        ) }
      </Box>

      <Typography variant="subtitle2" fontWeight="bold">
        {schedule.type}
      </Typography>
      { isStringReplace ? (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>🧵</Box>
            <Typography variant="body2">{schedule.string}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📏</Box>
            <Typography variant="body2">{schedule.tension} lbs</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📍</Box>
            <Typography variant="body2">{schedule.place}</Typography>
          </Box>
        </>
      ) : isTournament ? (
        // 대회 정보 표시
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
      ) }
      {schedule.source && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>📝</Box>
          <Typography variant="body2">{schedule.source}</Typography>
        </Box>
      )}
      {schedule.result && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>🎾</Box>
          <Typography variant="body2">{schedule.result}</Typography>
        </Box>
      )}
      {schedule.price && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box component="span" sx={{display: 'inline-block', width: '20px', textAlign: 'center', fontSize: '14px'}}>💰</Box>
          <Typography variant="body2">
            {schedule.price.toLocaleString()}
            {isLesson ? '원/월' : '원'}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
