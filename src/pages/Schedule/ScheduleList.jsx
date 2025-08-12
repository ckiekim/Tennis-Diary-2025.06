import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Fab, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc, arrayUnion, writeBatch, serverTimestamp } from 'firebase/firestore';

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

const ScheduleList = () => {
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
  const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

  const handleAddSchedule = async () => {
    if (!form.type) return;

    if (form.type === '스트링 교체') {
      if (!form.string || !form.tension || !form.place) {
        alert('스트링 교체 항목을 모두 입력해주세요.');
        return;
      }
    } else if (form.type === '대회') {
      if (!form.name || !form.category) {
        alert('대회 항목을 모두 입력해주세요.');
        return;
      }
    } else {
      if (!form.time || !form.place) {
        alert('시간과 장소를 입력해주세요.');
        return;
      }
    }
    if (!user?.uid) {
      alert("사용자 인증 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const dataToSubmit = {
      ...form,
      uid: user.uid,
      date: selectedDate.format('YYYY-MM-DD'),
      createdAt: serverTimestamp()
    };
    if (dataToSubmit.price) 
      dataToSubmit.price = Number(dataToSubmit.price);

    await addDoc(collection(db, 'events'), dataToSubmit);

    // 🔁 0.3초후 화면 강제 리렌더
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);

    setAddOpen(false);
    setForm({ type: '', time: '', place: '', source: '' });
  };

  const handleAddRecurringSchedule = async (recurringOptions) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    
    // 장소와 종료일이 입력되었는지 확인합니다.
    if (!form.place || !endDate) {
      alert('장소와 종료일을 모두 입력해주세요.');
      return;
    }

    // 여러 문서를 한 번에 쓰기 위한 batch 생성
    const batch = writeBatch(db);
    
    let currentDate = dayjs(); // 오늘부터 시작
    const finalDate = dayjs(endDate);

    while (currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
      const dayOfWeek = currentDate.day(); // 현재 날짜의 요일(숫자)
      // 첫 번째 요일과 일치하는 경우
      if (dayOfWeek === dayMap[day1]) {
        const newEventRef = doc(collection(db, 'events'));
        batch.set(newEventRef, {
          uid: user.uid,
          type: '레슨',
          date: currentDate.format('YYYY-MM-DD'),
          time: time1,
          place: form.place, // 공통 form 상태에서 장소 가져오기
          price: Number(monthlyPrice),
          isRecurring: true, // 반복 일정임을 표시
          createdAt: serverTimestamp()
        });
      }
      // 주 2회인 경우, 두 번째 요일과 일치하는지 확인
      if (frequency === 2 && dayOfWeek === dayMap[day2]) {
        const newEventRef = doc(collection(db, 'events'));
        batch.set(newEventRef, {
          uid: user.uid,
          type: '레슨',
          date: currentDate.format('YYYY-MM-DD'),
          time: time2,
          place: form.place, // 공통 form 상태에서 장소 가져오기
          price: Number(monthlyPrice),
          isRecurring: true, // 반복 일정임을 표시
          createdAt: serverTimestamp()
        });
      }
      
      currentDate = currentDate.add(1, 'day'); // 다음 날짜로 이동
    }

    await batch.commit(); // batch에 담긴 모든 쓰기 작업을 한 번에 실행

    // 작업 완료 후 상태 초기화 및 화면 새로고침
    setAddOpen(false);
    setForm({ type: '', time: '', place: '', source: '' });
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);
  };

  const handleUpdate = async () => {
    if (!selectedSchedule?.id) return; // 예외 처리
    const docRef = doc(db, 'events', selectedSchedule.id);
    const { id, ...updateData } = selectedSchedule;
    if (updateData.price && typeof updateData.price === 'string') {
      updateData.price = Number(updateData.price);
    }
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

  const handleResult = async (id, { result, memo, photoList }) => {
    if (!id) return;  // 예외 처리
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, {
      result, memo,
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
        courts={courts} open={addOpen} form={form} setOpen={setAddOpen} setForm={setForm} 
        onAddSchedule={handleAddSchedule} onAddRecurringSchedule={handleAddRecurringSchedule}
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

export default ScheduleList;