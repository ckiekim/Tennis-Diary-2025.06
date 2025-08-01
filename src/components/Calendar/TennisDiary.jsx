import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Fab, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc, arrayUnion } from 'firebase/firestore';

import useAuthState from '../../hooks/useAuthState';
import useEventDateMap from '../../hooks/useEventDateMap';
import useScheduleByDate from '../../hooks/useScheduleByDate';
import useCourtList from '../../hooks/useCourtList';
import KoreanDatePicker from './KoreanDatePicker';
import ScheduleCard from './ScheduleCard';
import AddScheduleDialog from './dialogs/AddScheduleDialog';
import EditScheduleDialog from './dialogs/EditScheduleDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import ResultDialog from './dialogs/ResultDialog';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const TennisDiary = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const [uid, setUid] = useState('');
  const eventDateMap = useEventDateMap(refreshKey);
  const schedules = useScheduleByDate(selectedDate, refreshKey);
  const { user } = useAuthState();
  const courts = useCourtList();
  const navigate = useNavigate();

  const [form, setForm] = useState({ type: '', time: '', place: '', source: '', });
  useEffect(() => {
    if (user?.uid) {
      setForm((prev) => ({ ...prev, uid: user.uid }));
      setUid(user.uid);
    }
  }, [user]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState(null);

  const handleAddSchedule = async () => {
    if (!form.type) return;

    if (form.type === '스트링 교체') {
      if (!form.string || !form.tension || !form.place) {
        alert('스트링 교체 항목을 모두 입력해주세요.');
        return;
      }
    } else {
      if (!form.time || !form.place) {
        alert('시간과 장소를 입력해주세요.');
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

    setAddOpen(false);
    setForm({ type: '', time: '', place: '', source: '' });
  };

  const handleUpdate = async () => {
    if (!selectedSchedule?.id) return; // 예외 처리
    const docRef = doc(db, 'events', selectedSchedule.id);
    const { id, ...updateData } = selectedSchedule;
    await updateDoc(docRef, updateData);
    setEditOpen(false);
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);
  }

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule); // 선택된 일정 전달
    setEditOpen(true);
  };
  
  const handleDelete = async (schedule) => {
    setSelectedSchedule(schedule);
    setDeleteOpen(true);
  }

  const handleDeleteConfirm = async () => {
    await deleteDoc(doc(db, 'events', selectedSchedule.id));
    setDeleteOpen(false);
    setRefreshKey((prev) => prev + 1);
  }
  
  const handleResultDialog = (schedule) => {
    setResultTarget(schedule);
    setResultOpen(true);
  };

  const handleResult = async (id, { result, price, memo, photoList }) => {
    if (!id) return;  // 예외 처리
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, {
      result, price, memo,
      photoList: arrayUnion(...photoList),   // 사진은 여러 장 저장할 수 있으니 배열 유지
    });
    setResultOpen(false);
    setRefreshKey((prev) => prev + 1);
    navigate('/result/game');
  }

  return (
    <Container maxWidth="sm">
      {/* 📅 한글 달력 */}
      <KoreanDatePicker value={selectedDate} onChange={setSelectedDate} eventDateMap={eventDateMap}/>

      {/* 선택된 날짜 정보 */}
      <Box mt={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthIcon />
          <Typography variant="subtitle1" fontWeight="bold">
            {selectedDate.format('YYYY.MM.DD (ddd)')}
          </Typography>
        </Stack>

        {schedules.length === 0 ? (
          <Typography color="text.secondary" mt={1}>
            일정이 없습니다.
          </Typography>
        ) : (
          <Box mt={1}>
            {schedules.map(schedule => 
              <ScheduleCard key={schedule.id} schedule={schedule} onEdit={handleEdit} onDelete={handleDelete} onResult={handleResultDialog} />)}
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
        onClick={() => setAddOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* 일정 추가 다이얼로그 */}
      <AddScheduleDialog 
        courts={courts} open={addOpen} form={form} setOpen={setAddOpen} setForm={setForm} onAddSchedule={handleAddSchedule} 
      />

      {/* 일정 수정 다이얼로그 */}
      <EditScheduleDialog 
        courts={courts} open={editOpen} selectedSchedule={selectedSchedule} 
        setOpen={setEditOpen} setSelectedSchedule={setSelectedSchedule} onUpdate={handleUpdate} 
      />

      <DeleteConfirmDialog
        open={deleteOpen} onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm} schedule={selectedSchedule}
      />

      {/* 결과 입력 다이얼로그 */}
      <ResultDialog 
        open={resultOpen} target={resultTarget} setOpen={setResultOpen} onResult={handleResult} uid={uid}
      />

    </Container>
  );
};

export default TennisDiary;