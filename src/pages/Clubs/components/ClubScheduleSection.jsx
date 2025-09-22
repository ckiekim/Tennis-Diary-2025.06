import { Box, Button, CircularProgress, IconButton, List, ListItem, ListItemText, Stack, Typography } from '@mui/material';
import EventNoteIcon from '@mui/icons-material/EventNote';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import DeleteIcon from '@mui/icons-material/Delete';
import PostAddIcon from '@mui/icons-material/PostAdd';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import dayjs from 'dayjs';

const ClubScheduleSection = ({
  schedules, isOwner, isMember, user, onAddScheduleClick, 
  onEditSchedule, onDeleteSchedule, onResultClick, loadingMore, hasMore, onLoadMore
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
            const isPastOrToday  = dayjs().isSameOrAfter(dayjs(schedule.date), 'day');
            const canAddResult = isMember && isPastOrToday  && !schedule.userHasSubmitted;
            const displayPlace = schedule.placeInfo.courtType === '실내'
              ? `${schedule.placeInfo.courtName} (실내)` : schedule.placeInfo.courtName;

            return (
              <ListItem sx={{ py: 0 }}
                key={schedule.id}
                secondaryAction={
                  <Stack direction="row" spacing={0.2}>
                    {/* 멤버이고 지난 일정이면 '결과 입력' 버튼 표시 */}
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
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </Stack>
                }
              >
                <ListItemText
                  primary={
                    <Typography variant="body2">
                      {`${schedule.type} - ${displayPlace}`}
                    </Typography>
                  }
                  secondary={
                    <Box display="flex" alignItems="center" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                      {`${dayjs(schedule.date).format('YYYY.MM.DD (ddd)')} ${schedule.time || ''}`}
                      {schedule.hasResult && 
                        <CheckCircleOutlineIcon sx={{ fontSize: '0.75rem', ml: 0.7, color: 'green', fontWeight: 'bold' }} />
                      }
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

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0 }}>
        {loadingMore ? (
          <CircularProgress size={24} />
        ) : (
          hasMore && (
            <Button onClick={onLoadMore} size="small">
              더보기
            </Button>
          )
        )}
      </Box>
    </>
  );
};

export default ClubScheduleSection;