import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../api/firebaseConfig';
import { 
  addDoc, arrayUnion, collection, deleteField, doc, getDocs, increment, query, serverTimestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { deletePhotoFromStorage } from '../api/firebaseStorage';
import dayjs from 'dayjs';
import { createPlaceInfo } from '../utils/handlePlaceInfo';

export const useScheduleManager = (selectedDate, user, courts) => {
  const navigate = useNavigate();

  // 상태 관리
  const [form, setForm] = useState({ type: '게임', place: '', club: '', date: selectedDate.format('YYYY-MM-DD') });
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [resultOpen, setResultOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [resultTarget, setResultTarget] = useState(null);
  const [deleteAllRecurring, setDeleteAllRecurring] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
  
  useEffect(() => {
    // 날짜가 변경되면 form의 date도 업데이트
    setForm(prev => ({ ...prev, date: selectedDate.format('YYYY-MM-DD') }));
  }, [selectedDate]);

  // 핸들러 함수들
  const handleOpenAddDialog = () => {
    setForm(prev => ({ 
      ...prev, 
      type: '게임',
      date: selectedDate.format('YYYY-MM-DD') 
    }));
    setAddOpen(true);
  };

  const handleAddSchedule = async (formData) => {
    const placeInfo = createPlaceInfo(formData);
    if (!placeInfo) {
      setAlertMessage('장소를 입력해주세요.');
      setIsAlertOpen(true);
      return;
    }
    const dataToSubmit = {
      ...formData,
      placeInfo, // 새로 생성한 placeInfo 객체를 추가
      price: Number(formData.price ?? 0),
      uid: user.uid,
      participantUids: [user.uid],
      createdAt: serverTimestamp()
    };
    delete dataToSubmit.place; // 기존 place 필드 삭제
    delete dataToSubmit.placeSelection; // 임시 선택 정보 필드 삭제

    await addDoc(collection(db, 'events'), dataToSubmit);
    await updateDoc(doc(db, 'users', user.uid), { mileage: increment(5) });
    setAddOpen(false);
  };

  const handleAddRecurringSchedule = async (recurringOptions, formData) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    const placeInfo = createPlaceInfo(formData);
    if (!placeInfo || !endDate) {
      setAlertMessage('장소와 종료일을 모두 입력해주세요.');
      setIsAlertOpen(true);
      return;
    }
    const batch = writeBatch(db);
    const recurringId = doc(collection(db, 'events')).id;
    let currentDate = dayjs(selectedDate);
    const finalDate = dayjs(endDate);
    let eventCount = 0;
    const addEventToBatch = (date, time) => {
      const newEventRef = doc(collection(db, 'events'));
      const dataToSave = {
        uid: user.uid,
        participantUids: [user.uid],
        type: formData.type,
        date: date.format('YYYY-MM-DD'),
        time,
        place: formData.place,
        price: Number(monthlyPrice),
        isRecurring: true,
        recurringId: recurringId,
        createdAt: serverTimestamp(),
        club: formData.club || null
      };
      batch.set(newEventRef, dataToSave);
      eventCount++;
    };
    while(currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
      const dayOfWeek = currentDate.day();
      if(dayOfWeek === dayMap[day1]) addEventToBatch(currentDate, time1);
      if(frequency === 2 && dayOfWeek === dayMap[day2]) addEventToBatch(currentDate, time2);
      currentDate = currentDate.add(1, 'day');
    }
    if(user?.uid && eventCount > 0) {
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(eventCount * 5) });
    }
    await batch.commit();
    setAddOpen(false);
  };

  const handleEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setEditOpen(true);
  };

  const handleUpdate = async (scheduleToUpdate) => {
    if (!scheduleToUpdate?.id) return;

    // placeSelection이 있으면 새로운 placeInfo를 생성, 없으면 기존 값을 유지
    const placeInfo = scheduleToUpdate.placeSelection 
      ? createPlaceInfo(scheduleToUpdate) 
      : scheduleToUpdate.placeInfo;
    const updateData = {
      ...scheduleToUpdate,
      price: Number(scheduleToUpdate.price ?? 0),
    };
    if (placeInfo) {
      updateData.placeInfo = placeInfo;
    }

    // 임시 필드와 더 이상 사용하지 않는 필드 삭제
    delete updateData.id;
    delete updateData.place;
    delete updateData.placeSelection;
    
    try {
      await updateDoc(doc(db, 'events', scheduleToUpdate.id), updateData);
      setEditOpen(false);
    } catch (error) {
      console.error("❌ Firestore 업데이트 실패:", error);
      setAlertMessage('업데이트 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  const handleDelete = (schedule) => {
    setSelectedSchedule(schedule);
    setDeleteAllRecurring(false);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSchedule?.id || !user?.uid) return;
    // ... 기존 handleDeleteConfirm 로직 ...
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid);
    if (deleteAllRecurring && selectedSchedule.recurringId) {
      const q = query(collection(db, 'events'), where('recurringId', '==', selectedSchedule.recurringId));
      const querySnapshot = await getDocs(q);
      let totalPointsToDeduct = 0;
      for (const eventDoc of querySnapshot.docs) {
        const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
        const resultsSnapshot = await getDocs(resultsRef);
        if (resultsSnapshot.empty) {
          totalPointsToDeduct += 5;
          batch.delete(eventDoc.ref);
        } else {
          batch.update(eventDoc.ref, { isRecurring: deleteField(), recurringId: deleteField() });
        }
      }
      if (totalPointsToDeduct > 0) batch.update(userRef, { mileage: increment(-totalPointsToDeduct) });
    } else {
      let pointsToDeduct = 5;
      const eventRef = doc(db, 'events', selectedSchedule.id);
      const resultsRef = collection(db, 'events', selectedSchedule.id, 'event_results');
      const resultsSnapshot = await getDocs(resultsRef);
      if (!resultsSnapshot.empty) {
        pointsToDeduct += 5;
        for (const resultDoc of resultsSnapshot.docs) {
          const resultData = resultDoc.data();
          if (resultData.photoList?.length > 0) {
            for (const url of resultData.photoList) await deletePhotoFromStorage(url);
          }
          batch.delete(resultDoc.ref);
        }
      }
      batch.delete(eventRef);
      batch.update(userRef, { mileage: increment(-pointsToDeduct) });
    }
    await batch.commit();
    setDeleteOpen(false);
  };

  const handleResultDialog = (schedule) => {
    setResultTarget(schedule);
    setResultOpen(true);
  };

  const handleResult = async (id, resultData) => {
    // ... 기존 handleResult 로직 ...
    const { type, result, memo, photoList } = resultData;
    const resultsCollectionRef = collection(db, 'events', id, 'event_results');
    const q = query(resultsCollectionRef, where('uid', '==', user.uid));
    const existingResultSnapshot = await getDocs(q);
    if (existingResultSnapshot.empty) {
      const batch = writeBatch(db);
      const newResultRef = doc(collection(db, 'events', id, 'event_results'));
      batch.set(newResultRef, { result, memo, uid: user.uid, eventId: id, createdAt: serverTimestamp(), photoList });
      batch.update(doc(db, 'events', id), { participantUids: arrayUnion(user.uid) });
      batch.update(doc(db, 'users', user.uid), { mileage: increment(5) });
      await batch.commit();
    } else {
      const existingDocRef = existingResultSnapshot.docs[0].ref;
      await updateDoc(existingDocRef, { result, memo, photoList });
    }
    setResultOpen(false);
    if (type === '대회') navigate('/result/tournament');
    else navigate('/result/game');
  };

  // UI 컴포넌트에서 사용할 상태와 함수들을 반환
  return {
    form, setForm,
    addOpen, setAddOpen,
    editOpen, setEditOpen,
    deleteOpen, setDeleteOpen,
    resultOpen, setResultOpen,
    isAlertOpen, setIsAlertOpen,
    selectedSchedule, setSelectedSchedule,
    resultTarget,
    deleteAllRecurring, setDeleteAllRecurring,
    alertMessage,
    handleOpenAddDialog,
    handleAddSchedule,
    handleAddRecurringSchedule,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleDeleteConfirm,
    handleResultDialog,
    handleResult,
  };
};