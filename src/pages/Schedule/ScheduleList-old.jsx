import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Checkbox, Container, Fab, FormControlLabel, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';
import { db } from '../../api/firebaseConfig';
import { 
  addDoc, arrayUnion, collection, deleteField, doc, getDocs, increment, query, serverTimestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';

import useAuthState from '../../hooks/useAuthState';
import useEventDateMap from '../../hooks/useEventDateMap';
import useScheduleByDate from '../../hooks/useScheduleByDate';
import useCourtList from '../../hooks/useCourtList';
import KoreanDatePicker from './components/KoreanDatePicker';
import ScheduleCard from './components/ScheduleCard';
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
      uid: user.uid, participantUids: [user.uid],
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
        time, place: form.place, price: Number(monthlyPrice), participantUids: [user.uid],
        isRecurring: true, recurringId: recurringId,
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

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid);

    // 반복 일정 전체 삭제
    if (deleteAllRecurring && selectedSchedule.recurringId) {
      const q = query(collection(db, 'events'), where('recurringId', '==', selectedSchedule.recurringId));
      const querySnapshot = await getDocs(q);
      
      let totalPointsToDeduct = 0;
  
      for (const eventDoc of querySnapshot.docs) {
        // 각 일정의 event_results 하위 컬렉션 확인 및 삭제
        const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
        const resultsSnapshot = await getDocs(resultsRef);

        // 결과가 없으면 삭제
        if (resultsSnapshot.empty) {
          totalPointsToDeduct += 5; // 일정 생성 포인트만 차감
          batch.delete(eventDoc.ref);
        } else {
          // 결과가 있으면 반복 속성만 제거하여 단일 일정으로 남김
          batch.update(eventDoc.ref, {
            isRecurring: deleteField(),
            recurringId: deleteField()
          });
        }
      }
      if (totalPointsToDeduct > 0) {
        batch.update(userRef, { mileage: increment(-totalPointsToDeduct) });
      }
    } else {
      // 단일 일정 삭제
      let pointsToDeduct = 5; // 일정 생성 포인트
      const eventRef = doc(db, 'events', selectedSchedule.id);
  
      // event_results 하위 컬렉션 확인 및 삭제
      const resultsRef = collection(db, 'events', selectedSchedule.id, 'event_results');
      const resultsSnapshot = await getDocs(resultsRef);
      if (!resultsSnapshot.empty) {
        pointsToDeduct += 5; // 결과 등록 포인트
        for (const resultDoc of resultsSnapshot.docs) {
          const resultData = resultDoc.data();
            if (resultData.photoList && resultData.photoList.length > 0) {
              for (const url of resultData.photoList) {
                await deletePhotoFromStorage(url); // Storage에서 사진 파일 삭제
              }
            }
            batch.delete(resultDoc.ref);
        }
      }
      batch.delete(eventRef);
      batch.update(userRef, { mileage: increment(-pointsToDeduct) });
    }
  
    await batch.commit();
    setDeleteOpen(false);
    setRefreshKey((prev) => prev + 1);
  };
  
  const handleResultDialog = (schedule) => {
    setResultTarget(schedule);
    setResultOpen(true);
  };

  const handleResult = async (id, { type, result, memo, photoList }) => {
    if (!id || !user?.uid) return;

    const resultsCollectionRef = collection(db, 'events', id, 'event_results');
    // 1. 현재 유저가 이미 결과를 냈는지 확인
    const q = query(resultsCollectionRef, where('uid', '==', user.uid));
    const existingResultSnapshot = await getDocs(q);

    if (existingResultSnapshot.empty) {
      // 2-1. 기존 결과가 없으면: 새로 생성 (Create)
      const batch = writeBatch(db);
      
      // 새 결과 문서 추가
      const newResultRef = doc(collection(db, 'events', id, 'event_results'));
      const dataToSave = {
        result, memo, uid: user.uid, eventId: id,
        createdAt: serverTimestamp(), photoList,
      };
      batch.set(newResultRef, dataToSave);

      // 부모 event 문서에 참여자 추가
      const eventRef = doc(db, 'events', id);
      batch.update(eventRef, { participantUids: arrayUnion(user.uid) });
      
      // 마일리지 지급
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(5) });

      await batch.commit();

    } else {
      // 2-2. 기존 결과가 있으면: 수정 (Update)
      const existingDocRef = existingResultSnapshot.docs[0].ref;
      await updateDoc(existingDocRef, {
        result,
        memo,
        photoList, // 사진은 덮어쓰기
      });
    }
    
    setResultOpen(false);
    setRefreshKey((prev) => prev + 1);
    
    if (type === '대회')
      navigate('/result/tournament');
    else
      navigate('/result/game');
  };

  const handleOpenAddDialog = () => {
    // 다이얼로그를 열기 전에, 현재 선택된 날짜로 form 상태를 미리 설정합니다.
    setForm(prev => ({ 
      ...prev, 
      type: '게임', // 기본값 설정
      date: selectedDate.format('YYYY-MM-DD') 
    }));
    setAddOpen(true);
  };

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
            {schedules.map(schedule => ( 
              <ScheduleCard 
                key={schedule.id} schedule={schedule} onResult={handleResultDialog} 
                onEdit={user?.uid === schedule.uid ? handleEdit : undefined} 
                onDelete={user?.uid === schedule.uid ? handleDelete : undefined} 
              />
            ))}
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
        onClick={handleOpenAddDialog}
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
        "{selectedSchedule?.date} {selectedSchedule?.type}" 일정을 삭제하시겠습니까? 
        {selectedSchedule?.isRecurring && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <FormControlLabel
              control={<Checkbox checked={deleteAllRecurring} onChange={(e) => setDeleteAllRecurring(e.target.checked)} />}
              label="이 반복 일정 전체를 삭제합니다. 단 결과가 입력된 일정은 삭제되지 않습니다."
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