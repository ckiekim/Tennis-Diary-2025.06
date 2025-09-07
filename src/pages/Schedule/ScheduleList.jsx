import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Checkbox, Container, Fab, FormControlLabel, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../api/firebaseConfig';
import { 
  collection, addDoc, deleteDoc, updateDoc, doc, arrayUnion, writeBatch, serverTimestamp, increment, getDocs, query, where
} from 'firebase/firestore';

import useAuthState from '../../hooks/useAuthState';
import useEventDateMap from '../../hooks/useEventDateMap';
import useScheduleByDate from '../../hooks/useScheduleByDate';
import useCourtList from '../../hooks/useCourtList';
import KoreanDatePicker from './KoreanDatePicker';
import ScheduleCard from './ScheduleCard';
import AddScheduleDialog from './dialogs/AddScheduleDialog';
import EditScheduleDialog from './dialogs/EditScheduleDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import ResultDialog from './dialogs/ResultDialog';
import AlertDialog from '../../components/AlertDialog';

import AddIcon from '@mui/icons-material/Add';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const ScheduleList = () => {
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [refreshKey, setRefreshKey] = useState(0);
  const [uid, setUid] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const eventDateMap = useEventDateMap(refreshKey);
  const schedules = useScheduleByDate(selectedDate, refreshKey);
  const { user } = useAuthState();
  const courts = useCourtList();
  const navigate = useNavigate();

  const [form, setForm] = useState({ type: '', place: '', club: '' });
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
  const [deleteAllRecurring, setDeleteAllRecurring] = useState(false);
  const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

  const handleAddSchedule = async () => {
    if (!form.type) return;
    
    if (form.type === '정모') {
      if (!form.club || !form.place) {
        setAlertMessage('정모 항목을 모두 입력해주세요.');
        setIsAlertOpen(true);
        return;
      }
    } else if (form.type === '대회') {
      if (!form.name || !form.category) {
        setAlertMessage('대회 항목을 모두 입력해주세요.');
        setIsAlertOpen(true);
        return;
      }
    } else {
      // console.log(form);
      if (!form.time || !form.place) {
        setAlertMessage('시간과 장소를 입력해주세요.');
        setIsAlertOpen(true);
        return;
      }
    }
    if (!user?.uid) {
      setAlertMessage('사용자 인증 정보를 가져오는 중입니다. 잠시 후 다시 시도해주세요.');
      setIsAlertOpen(true);
      return;
    }

    const courtNames = courts.map(court => court.name);
    const isCustom = form.place && !courtNames.includes(form.place);
    const dataToSubmit = {
      ...form,
      uid: user.uid,
      date: selectedDate.format('YYYY-MM-DD'),
      isPlaceCustom: isCustom,
      createdAt: serverTimestamp()
    };
    if (dataToSubmit.price) 
      dataToSubmit.price = Number(dataToSubmit.price);

    await addDoc(collection(db, 'events'), dataToSubmit);
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { mileage: increment(5) });

    // 🔁 0.3초후 화면 강제 리렌더
    setTimeout(() => {
      setRefreshKey(prev => prev + 1);
    }, 300);

    setAddOpen(false);
    setForm({ type: '', place: '' });
  };

  const handleAddRecurringSchedule = async (recurringOptions) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    
    if (!form.place || !endDate) {
      setAlertMessage('장소와 종료일을 모두 입력해주세요.');
      setIsAlertOpen(true);
      return;
    }

    // 여러 문서를 한 번에 쓰기 위한 batch 생성
    const batch = writeBatch(db);
    const recurringId = doc(collection(db, 'events')).id;
    
    let currentDate = dayjs(selectedDate); 
    const finalDate = dayjs(endDate);
    let eventCount = 0;

    const addEventToBatch = (batch, date, time) => {
      const newEventRef = doc(collection(db, 'events'));
      const dataToSave = {
        uid: user.uid, type: form.type, date: date.format('YYYY-MM-DD'),
        time, place: form.place, price: Number(monthlyPrice),
        isRecurring: true, 
        recurringId: recurringId,
        createdAt: serverTimestamp()
      }
      if (form.type === '정모') {
        dataToSave.club = form.club;
      }
      batch.set(newEventRef, dataToSave);
    };

    while (currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
      const dayOfWeek = currentDate.day();
      
      if (dayOfWeek === dayMap[day1]) {
        addEventToBatch(batch, currentDate, time1);
        eventCount++;
      }
      if (frequency === 2 && dayOfWeek === dayMap[day2]) {
        addEventToBatch(batch, currentDate, time2);
        eventCount++;
      }
      currentDate = currentDate.add(1, 'day');
    }
    if (user?.uid && eventCount > 0) {
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(eventCount * 5) });
    }

    await batch.commit(); // batch에 담긴 모든 쓰기 작업을 한 번에 실행

    setAddOpen(false);
    setForm({ type: '', time: '', place: '', source: '', club: '' });
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
    setDeleteAllRecurring(false);
    setDeleteOpen(true);
  }

  const handleDeleteConfirm = async () => {
    if (!selectedSchedule?.id || !user?.uid) return;

    if (deleteAllRecurring && selectedSchedule.recurringId) {
      // 1. 동일한 recurringId를 가진 모든 일정 문서
      const q = query(collection(db, 'events'), where('recurringId', '==', selectedSchedule.recurringId));
      const querySnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      let totalPointsToDeduct = 0;

      // 2. 찾은 모든 문서를 삭제하고, 차감할 마일리지를 계산
      querySnapshot.forEach((document) => {
        const eventData = document.data();
        batch.delete(document.ref);
        totalPointsToDeduct += 5; // 생성 포인트
        if (eventData.result) {
          totalPointsToDeduct += 5; // 결과 등록 포인트
        }
      });

      // 3. 계산된 총 마일리지를 차감
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(-totalPointsToDeduct) });

      await batch.commit();

    } else {
      // 단일 일정 삭제
      await deleteDoc(doc(db, 'events', selectedSchedule.id));
      let pointsToDeduct = 5;
      if (selectedSchedule.result) {
        pointsToDeduct += 5;
      }
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-pointsToDeduct) });
    }

    setDeleteOpen(false);
    setRefreshKey((prev) => prev + 1);
  }
  
  const handleResultDialog = (schedule) => {
    setResultTarget(schedule);
    setResultOpen(true);
  };

  const handleResult = async (id, { type, result, memo, photoList }) => {
    if (!id) return;  // 예외 처리
    const docRef = doc(db, 'events', id);
    await updateDoc(docRef, {
      result, memo,
      photoList: arrayUnion(...photoList),   // 사진은 여러 장 저장할 수 있으니 배열 유지
    });
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, { mileage: increment(5) });
    
    setResultOpen(false);
    setRefreshKey((prev) => prev + 1);
    if (type === '대회')
      navigate('/result/tournament');
    else
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

      <AddScheduleDialog 
        courts={courts} open={addOpen} form={form} setOpen={setAddOpen} setForm={setForm} 
        selectedDate={selectedDate}
        onAddSchedule={handleAddSchedule} onAddRecurringSchedule={handleAddRecurringSchedule}
      />

      <EditScheduleDialog 
        courts={courts} open={editOpen} selectedSchedule={selectedSchedule} 
        setOpen={setEditOpen} setSelectedSchedule={setSelectedSchedule} onUpdate={handleUpdate} 
      />

      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteConfirm}>
        "{selectedSchedule?.date} {selectedSchedule?.type}" 일정을 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
        {selectedSchedule?.isRecurring && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <FormControlLabel
              control={<Checkbox checked={deleteAllRecurring} onChange={(e) => setDeleteAllRecurring(e.target.checked)} />}
              label="이 반복 일정 전체를 삭제합니다."
            />
          </Box>
        )}
      </DeleteConfirmDialog>

      <ResultDialog 
        open={resultOpen} target={resultTarget} setOpen={setResultOpen} onResult={handleResult} uid={uid}
      />

      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </Container>
  );
};

export default ScheduleList;