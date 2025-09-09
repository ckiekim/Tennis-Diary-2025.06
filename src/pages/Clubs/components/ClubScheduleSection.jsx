import { Box, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import dayjs from 'dayjs';

const ClubScheduleSection = ({
  schedules, isOwner, isMember, user,
  onAddScheduleClick, onEditSchedule, onDeleteSchedule,
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography fontSize="13" fontWeight="bold">클럽 일정</Typography>
        {isMember && ( // 멤버만 일정 추가 버튼 표시
          <IconButton size="small" onClick={onAddScheduleClick} title="새 일정 추가">
            <EventNoteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <List dense sx={{ ml: 3 }}>
        {schedules.length > 0 ? (
          schedules.map(schedule => (
            <ListItem
              key={schedule.id}
              secondaryAction={
                // 일정 생성자 또는 클럽장만 수정/삭제 가능
                (user?.uid === schedule.uid || isOwner) && (
                  <Stack direction="row" spacing={0.5}>
                    <IconButton edge="end" size="small" onClick={() => onEditSchedule(schedule)} title="수정">
                      <EditCalendarIcon fontSize="small" />
                    </IconButton>
                    <IconButton edge="end" size="small" onClick={() => onDeleteSchedule(schedule)} title="삭제">
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  </Stack>
                )
              }
            >
              <ListItemText
                primary={`${dayjs(schedule.date).format('YYYY.MM.DD (ddd)')} ${schedule.time || ''}`}
                secondary={`${schedule.type} - ${schedule.place}`}
              />
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 1 }}>
            등록된 클럽 일정이 없습니다.
          </Typography>
        )}
      </List>
    </>
  );
};

export default ClubScheduleSection;