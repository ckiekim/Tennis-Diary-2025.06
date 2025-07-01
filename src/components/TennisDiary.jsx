import React, { useState } from 'react';
import { Box, Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, Fab, IconButton, MenuItem, Stack, TextField, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

import KoreanDatePicker from './KoreanDatePicker';
import useEventDates from '../hooks/useEventDates';
import useScheduleByDate from '../hooks/useScheduleByDate';
import useCourtList from '../hooks/useCourtList';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import NotesIcon from '@mui/icons-material/Notes';

const TennisDiary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const eventDateMap = useEventDates(refreshKey);
  const schedules = useScheduleByDate(selectedDate, refreshKey);
  const courts = useCourtList();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: '', start_time: '', end_time: '', place: '', source: '', });
  const [editOpen, setEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);

  const handleAddSchedule = async () => {
    if (!form.type || !form.start_time || !form.place) return;

    await addDoc(collection(db, 'events'), {
      date: selectedDate.format('YYYY-MM-DD'),
      ...form,
    });

    // 🔁 0.3초후 화면 강제 리렌더
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);

    setOpen(false);
    setForm({ type: '', start_time: '', end_time: '', place: '', source: '' });
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule); // 선택된 일정 전달
    setEditOpen(true);
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('일정을 삭제할까요?')) {
      await deleteDoc(doc(db, 'events', id));
      setRefreshKey((prev) => prev + 1);
    }
  };
  
  const handleMemo = (schedule) => {
    console.log('📄 결과 입력 클릭:', schedule);
    // setOpenMemoDialog(true); 등
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 다이어리
      </Typography>

      {/* 📅 한글 달력 */}
      <KoreanDatePicker
        value={selectedDate}
        onChange={setSelectedDate}
        eventDateMap={eventDateMap}
      />

      {/* 선택된 날짜 정보 */}
      <Box mt={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon />
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedDate.format('YYYY.MM.DD (ddd)')} 일정
          </Typography>
        </Stack>

        {schedules.length === 0 ? (
          <Typography color="text.secondary" mt={1}>
            일정이 없습니다.
          </Typography>
        ) : (
          <Box mt={1}>
            {schedules.map((schedule) => (
              <Box
                key={schedule.id}
                sx={{
                  border: '1px solid #ccc',
                  borderRadius: 2,
                  p: 2,
                  mb: 1,
                  backgroundColor: '#f9f9f9',
                  position: 'relative',
                }}
              >
                {/* 아이콘 버튼 영역 */}
                <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.25 }}>
                  <IconButton size="small" onClick={() => handleEdit(schedule)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(schedule.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleMemo(schedule)}>
                    <NotesIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Typography variant="subtitle2" fontWeight="bold">
                  {schedule.type}
                </Typography>
                <Typography variant="body2">⏰ {schedule.start_time} - {schedule.end_time}</Typography>
                <Typography variant="body2">📍 {schedule.place} 테니스장</Typography>
                {schedule.source && (
                  <Typography variant="body2">📝 {schedule.source}</Typography>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>

      {/* ➕ 일정 추가 버튼 */}
      <Fab
        color="default"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: 'black',
          color: 'white',
          '&:hover': {
            backgroundColor: '#333',
          },
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* ➕ 일정 추가 다이얼로그 */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>일정 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="종류" select fullWidth value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <MenuItem value="게임">게임</MenuItem>
              <MenuItem value="레슨">레슨</MenuItem>
              <MenuItem value="대회">대회</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </TextField>
            <TextField
              label="시작 시간 (예: 10:00)" fullWidth value={form.start_time}
              onChange={(e) => setForm({ ...form, start_time: e.target.value })}
            />
            <TextField
              label="종료 시간 (예: 13:00)" fullWidth value={form.end_time}
              onChange={(e) => setForm({ ...form, end_time: e.target.value })}
            />
            <TextField
              label="장소" select fullWidth value={form.place}
              onChange={(e) => setForm({ ...form, place: e.target.value })}>
              {courts.map((court) => (
                <MenuItem key={court.id} value={court.name}>
                  {court.name} ({court.surface})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="소스" fullWidth value={form.source}
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>취소</Button>
          <Button onClick={handleAddSchedule} variant="contained" color="primary">
            저장
          </Button>
        </DialogActions>
      </Dialog>

      {/* 일정 수정 다이얼로그 */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
        <DialogTitle>일정 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              label="종류" select fullWidth value={editingSchedule?.type || ''}
              onChange={(e) => setEditingSchedule({ ...editingSchedule, type: e.target.value })}
            >
              <MenuItem value="레슨">레슨</MenuItem>
              <MenuItem value="게임">게임</MenuItem>
              <MenuItem value="대회">대회</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </TextField>
            <TextField
              label="시작 시간" fullWidth value={editingSchedule?.start_time || ''}
              onChange={(e) => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })}
            />
            <TextField
              label="종료 시간" fullWidth value={editingSchedule?.end_time || ''}
              onChange={(e) => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })}
            />
            <TextField
              label="장소" select fullWidth value={editingSchedule?.place || ''}
              onChange={(e) => setEditingSchedule({ ...editingSchedule, place: e.target.value })}>
              {courts.map((court) => (
                <MenuItem key={court.id} value={court.name}>
                  {court.name} ({court.surface})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="소스" fullWidth value={editingSchedule?.source || ''}
              onChange={(e) => setEditingSchedule({ ...editingSchedule, source: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>취소</Button>
          <Button
            variant="contained"
            onClick={async () => {
              const docRef = doc(db, 'events', editingSchedule.id);
              const { id, ...updateData } = editingSchedule;
              await updateDoc(docRef, updateData);
              setEditOpen(false);
              setRefreshKey((prev) => prev + 1); // ✅ 변경사항 반영
            }}
          >
            수정
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
};

export default TennisDiary;