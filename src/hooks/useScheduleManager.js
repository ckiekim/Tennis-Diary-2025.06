import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../api/firebaseConfig';
import { 
  arrayUnion, collection, doc, getDocs, increment, query, serverTimestamp, updateDoc, where, writeBatch
} from 'firebase/firestore';
import dayjs from 'dayjs';
import useScheduleHandler from './useScheduleHandler';
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
  
  const scheduleHandler = useScheduleHandler(user, selectedDate);
  
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
    try {
      await scheduleHandler.handleAddSchedule(formData);
      setAddOpen(false);
    } catch (error) {
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    }
  };

  const handleAddRecurringSchedule = async (recurringOptions, formData) => {
    try {
      await scheduleHandler.handleAddRecurringSchedule(recurringOptions, formData);
      setAddOpen(false);
    } catch (error) {
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    }
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
    try {
      await scheduleHandler.handleUpdateSchedule(payload, recurringEditInfo);
      setEditOpen(false);
    } catch (error) {
      setAlertMessage(error.message);
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
    try {
      await scheduleHandler.handleDeleteSchedule(selectedSchedule, deleteAllRecurring);
      setDeleteOpen(false);
    } catch (error) {
      setAlertMessage(error.message);
      setIsAlertOpen(true);
    }
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