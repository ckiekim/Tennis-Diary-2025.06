import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../api/firebaseConfig';
import { 
  addDoc, arrayUnion, collection, deleteField, doc, getDocs, increment, query, serverTimestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import { deletePhotoFromStorage } from '../api/firebaseStorage';
import dayjs from 'dayjs';
import { createPlaceInfo } from '../utils/handlePlaceInfo';
import { dayMap } from '../constants/global';

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
  const [recurringEditInfo, setRecurringEditInfo] = useState({ price: '', endDate: '' });
  const [resultTarget, setResultTarget] = useState(null);
  const [deleteAllRecurring, setDeleteAllRecurring] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  
  useEffect(() => {
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

    const today = dayjs().startOf('day');
    const selected = dayjs(selectedDate);

    // 1. 오늘 이전 날짜를 선택했는지 확인합니다.
    if (selected.isBefore(today)) {
      setAlertMessage('오늘 이전 날짜에는 반복 일정을 생성할 수 없습니다.');
      setIsAlertOpen(true);
      return;
    }

    // 2. 반복을 시작할 첫 번째 날짜를 계산합니다.
    const getFirstEventDate = (start, targetDay) => {
      let firstDate = dayjs(start).day(dayMap[targetDay]);
      // 계산된 날짜가 시작 기준일보다 이전이면, 다음 주로 넘깁니다.
      if (firstDate.isBefore(start, 'day')) {
        firstDate = firstDate.add(1, 'week');
      }
      return firstDate;
    };
    
    // 3. 계산된 첫 날짜부터 반복 생성을 시작합니다.
    let currentDate = getFirstEventDate(selected, day1);

    const batch = writeBatch(db);
    const recurringId = doc(collection(db, 'events')).id;
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
        placeInfo,
        price: Number(monthlyPrice),
        isRecurring: true,
        recurringId: recurringId,
        createdAt: serverTimestamp(),
        club: formData.club || null
      };
      batch.set(newEventRef, dataToSave);
      eventCount++;
    };

    let secondCurrentDate = (frequency === 2) ? getFirstEventDate(selected, day2) : null;
    while(currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
      // 첫 번째 요일에 해당하는 일정을 추가
      addEventToBatch(currentDate, time1);
      // 주 2회일 경우, 두 번째 요일에 해당하는 일정도 추가
      if (secondCurrentDate && (secondCurrentDate.isBefore(finalDate) || secondCurrentDate.isSame(finalDate, 'day'))) {
        // 단, 두 날짜가 같지 않을 경우에만 추가하여 중복을 방지
        if (!currentDate.isSame(secondCurrentDate, 'day')) {
          addEventToBatch(secondCurrentDate, time2);
        }
        secondCurrentDate = secondCurrentDate.add(1, 'week');
      }
      currentDate = currentDate.add(1, 'week');
    }
    if(user?.uid && eventCount > 0) {
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(eventCount * 5) });
    }
    await batch.commit();
    setAddOpen(false);
  };

  const handleEdit = async (schedule) => {
    setSelectedSchedule(schedule);
    if (schedule.isRecurring && schedule.recurringId) {
      // 반복 일정인 경우, DB에서 해당 시리즈의 마지막 날짜를 찾음
      const q = query(collection(db, 'events'), where('recurringId', '==', schedule.recurringId));
      const querySnapshot = await getDocs(q);
      
      const daysOfWeek = new Set();
      const times = new Set();
      let lastDate = '';
      querySnapshot.forEach(doc => {
        const eventData = doc.data();
        const eventDate = dayjs(eventData.date);
        const dayName = ['일', '월', '화', '수', '목', '금', '토'][eventDate.day()];
        
        daysOfWeek.add(dayName);
        times.add(eventData.time);

        if (!lastDate || eventDate.isAfter(dayjs(lastDate))) {
          lastDate = eventData.date;
        }
      });

      const sortedDays = Array.from(daysOfWeek).sort((a, b) => dayMap[a] - dayMap[b]);
      const sortedTimes = Array.from(times);
      
      // 찾은 정보로 상태 업데이트
      setRecurringEditInfo({
        price: schedule.price,
        endDate: lastDate,
        frequency: sortedDays.length || 1,
        day1: sortedDays[0] || '월',
        time1: sortedTimes[0] || '',
        day2: sortedDays[1] || '수',
        time2: sortedTimes.length > 1 ? sortedTimes[1] : sortedTimes[0] || '',
      });
    } else {
      // 반복 일정이 아니면 recurringEditInfo를 초기화
      setRecurringEditInfo(null);
    }
    setEditOpen(true);
  };

  const handleUpdate = async (payload) => {
    const { form, scope } = payload;
    
    if (!form?.id) return;

    const placeInfo = createPlaceInfo(form);
    if (!placeInfo) {
      console.error("⛔️ 업데이트 중단: placeInfo를 생성할 수 없습니다.", form);
      // 사용자에게 알림을 보여주는 로직 추가 가능
      return;
    }

    // Case 1: 일반 단일 일정 수정 (게임, 대회 등)
    if (scope === null) {
      const updateData = { ...form, placeInfo, price: Number(form.price ?? 0) };
      delete updateData.id;
      delete updateData.place;
      delete updateData.placeSelection;
      delete updateData.recurringInfo;
      await updateDoc(doc(db, 'events', form.id), updateData);
    }
    // Case 2: 반복 일정 중 '이 일정만' 수정
    else if (scope === 'single') {
      const updateData = { ...form, placeInfo };
      
      const { time1, time2, monthlyPrice } = form.recurringInfo;
      const eventDayOfWeek = dayjs(form.date).day();
      if (recurringEditInfo.frequency === 1 || eventDayOfWeek === dayMap[recurringEditInfo.day1]) {
        updateData.time = time1;
      } else if (recurringEditInfo.frequency === 2 && eventDayOfWeek === dayMap[recurringEditInfo.day2]) {
        updateData.time = time2;
      }
      updateData.price = Number(monthlyPrice ?? 0);
      
      updateData.isRecurring = deleteField();
      updateData.recurringId = deleteField();
      
      delete updateData.id;
      delete updateData.place;
      delete updateData.placeSelection;
      delete updateData.recurringInfo;
      
      await updateDoc(doc(db, 'events', form.id), updateData);
    }
    // Case 3: '향후 모든 일정' 수정
    else if (scope === 'future' && form.recurringId) {
      const batch = writeBatch(db);
      const q = query(collection(db, 'events'), where('recurringId', '==', form.recurringId), where('date', '>=', form.date));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(eventDoc => batch.delete(eventDoc.ref));

      const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = form.recurringInfo;
      const newPrice = Number(monthlyPrice || 0);
      const baseEventData = {
        uid: form.uid, participantUids: form.participantUids, type: form.type,
        club: form.club || null, isRecurring: true, recurringId: form.recurringId,
      };
      
      let currentDate = dayjs(form.date).startOf('week');
      const finalDate = dayjs(endDate);
      
      const addEventToBatch = (date, time) => {
        const newEventRef = doc(collection(db, 'events'));
        const newEventData = {
          ...baseEventData,
          date: date.format('YYYY-MM-DD'), time: time, placeInfo: placeInfo,
          price: newPrice, createdAt: serverTimestamp(),
        };
        batch.set(newEventRef, newEventData);
      };

      while (currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
        const dayOfWeek = currentDate.day();
        if (dayOfWeek === dayMap[day1]) addEventToBatch(currentDate, time1);
        if (frequency === 2 && dayOfWeek === dayMap[day2]) addEventToBatch(currentDate, time2);
        currentDate = currentDate.add(1, 'day');
      }
      await batch.commit();
    }
    
    setEditOpen(false);
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
    recurringEditInfo,
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