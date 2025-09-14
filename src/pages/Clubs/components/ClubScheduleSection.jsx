import { Box, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';

const ClubScheduleSection = ({
  schedules, isOwner, isMember, user,
  onAddScheduleClick, onEditSchedule, onDeleteSchedule, onResultClick
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

      <List dense sx={{ ml: 0 }}>
        {schedules.length > 0 ? (
          schedules.map(schedule => {
            const isPast = dayjs().isAfter(dayjs(schedule.date), 'day'); // 지난 일정인지 확인
            const canAddResult = isMember && isPast && !schedule.currentUserHasSubmittedResult;
            return (
              <ListItem
                key={schedule.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.2}>
                    {/* 2. 멤버이고 지난 일정이면 '결과 입력' 버튼 표시 */}
                    {canAddResult && (
                      <IconButton edge="end" size="small" onClick={() => onResultClick(schedule)} title="결과 입력">
                        <PostAddIcon fontSize="small" />
                      </IconButton>
                    )}
                    {(user?.uid === schedule.uid || isOwner) && (
                      <>
                        <IconButton edge="end" size="small" onClick={() => onEditSchedule(schedule)} title="수정">
                          <EditCalendarIcon fontSize="small" />
                        </IconButton>
                        <IconButton edge="end" size="small" onClick={() => onDeleteSchedule(schedule)} title="삭제">
                          <DeleteForeverIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                }
              >
                <ListItemText
                  primary={`${schedule.type} - ${schedule.place}`}
                  secondary={
                    <Box display="flex" alignItems="center">
                      {`${dayjs(schedule.date).format('YYYY.MM.DD (ddd)')} ${schedule.time || ''}`}
                      {/* 3. 결과가 있으면 체크 아이콘 표시 (선택 사항) */}
                      {schedule.hasResult && <CheckCircleOutlineIcon sx={{ fontSize: 14, ml: 0.5, color: 'green' }} />}
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
            );
          })
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