import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Fab, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';

import useEventDates from '../../hooks/useEventDates';
import useScheduleByDate from '../../hooks/useScheduleByDate';
import useCourtList from '../../hooks/useCourtList';
import KoreanDatePicker from './KoreanDatePicker';
import ScheduleCard from './ScheduleCard';
import AddScheduleDialog from './dialogs/AddScheduleDialog';
import UpdateScheduleDialog from './dialogs/UpdateScheduleDialog';
import ResultDialog from './dialogs/ResultDialog';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const TennisDiary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const eventDateMap = useEventDates(refreshKey);
  const schedules = useScheduleByDate(selectedDate, refreshKey);
  const courts = useCourtList();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ type: '', start_time: '', end_time: '', place: '', source: '', });
  const [editOpen, setEditOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [memoOpen, setMemoOpen] = useState(false);
  const [memoTarget, setMemoTarget] = useState(null);

  const handleAddSchedule = async () => {
    if (!form.type) return;

    // 🔹 스트링 교체 타입일 경우
    if (form.type === '스트링 교체') {
      if (!form.string || !form.tension || !form.place) {
        alert('스트링 교체 항목을 모두 입력해주세요.');
        return;
      }
    } else {
      // 🔸 일반 일정일 경우
      if (!form.start_time || !form.place) {
        alert('시작 시간과 장소를 입력해주세요.');
        return;
      }
    }

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

  const handleUpdate = async () => {
    if (!editingSchedule?.id) return; // 예외 처리
    const docRef = doc(db, 'events', editingSchedule.id);
    const { id, ...updateData } = editingSchedule;
    await updateDoc(docRef, updateData);
    setEditOpen(false);
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);
  }

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
    setMemoTarget(schedule);
    setMemoOpen(true);
  };

  const handleResult = async () => {
    if (!memoTarget?.id) return; // 예외 처리
    const docRef = doc(db, 'events', memoTarget.id);
    const { id, ...updateData } = memoTarget;
    await updateDoc(docRef, updateData);
    setMemoOpen(false);
    setRefreshKey((prev) => prev + 1);
    navigate('/result');
  }

  return (
    <Container maxWidth="sm" sx={{ pt: 2 }}>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 다이어리
      </Typography>

      {/* 📅 한글 달력 */}
      <KoreanDatePicker value={selectedDate} onChange={setSelectedDate} eventDateMap={eventDateMap}/>

      {/* 선택된 날짜 정보 */}
      <Box mt={1}>
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
            {schedules.map(schedule => <ScheduleCard key={schedule.id} schedule={schedule} onEdit={handleEdit} onDelete={handleDelete} onMemo={handleMemo} />)}
          </Box>
        )}
      </Box>

      {/* ➕ 일정 추가 버튼 */}
      <Fab
        color="default"
        sx={{
          position: 'fixed', bottom: 80, right: 24, backgroundColor: 'black', color: 'white', zIndex: 20,
          '&:hover': { backgroundColor: '#333', },
        }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 일정 추가 다이얼로그 */}
      <AddScheduleDialog 
        courts={courts} open={open} form={form} setOpen={setOpen} setForm={setForm} onAddSchedule={handleAddSchedule}
      />

      {/* 일정 수정 다이얼로그 */}
      <UpdateScheduleDialog 
        courts={courts} editOpen={editOpen} editingSchedule={editingSchedule} 
        setEditOpen={setEditOpen} setEditingSchedule={setEditingSchedule} onUpdate={handleUpdate}
      />

      {/* 결과 입력 다이얼로그 */}
      <ResultDialog 
        memoOpen={memoOpen} memoTarget={memoTarget} setMemoOpen={setMemoOpen} setMemoTarget={setMemoTarget} onResult={handleResult}
      />

    </Container>
  );
};

export default TennisDiary;