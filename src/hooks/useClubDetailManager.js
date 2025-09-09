import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, writeBatch, setDoc, serverTimestamp, increment, collection, addDoc, deleteDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../api/firebaseConfig';
import useSnapshotDocument from './useSnapshotDocument';
import dayjs from 'dayjs';

export const useClubDetailManager = (clubId, user) => {
  const navigate = useNavigate();
  const { docData: club } = useSnapshotDocument('clubs', clubId);

  // 1. 모든 상태(State) 관리
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [kickTarget, setKickTarget] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [addScheduleOpen, setAddScheduleOpen] = useState(false);
  const [editScheduleOpen, setEditScheduleOpen] = useState(false);
  const [deleteScheduleOpen, setDeleteScheduleOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ 
    type: '정모', place: '', club: '',
    date: dayjs().format('YYYY-MM-DD') // 오늘 날짜를 기본값으로 설정 
  });
  console.log('[useClubDetailManager] 훅 렌더링. 현재 form.date:', scheduleForm.date);

  useEffect(() => {
    if (club) {
      setScheduleForm(prevForm => ({
        ...prevForm,
        club: club.name
      }));
    }
  }, [club]);

  // 2. 모든 핸들러 함수
  const handleAlert = (message) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  const handleUpdateClub = async (clubId, updatedData) => {
    try {
      await updateDoc(doc(db, 'clubs', clubId), updatedData);
      handleAlert('클럽 정보가 성공적으로 수정되었습니다.');
      setEditOpen(false);
    } catch (error) {
      console.error("클럽 정보 수정 실패:", error);
      handleAlert('클럽 정보 수정 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteClub = async () => {
    try {
      const deleteClub = httpsCallable(functions, 'deleteClub');
      await deleteClub({ clubId });
      setDeleteOpen(false);
      navigate('/clubs');
    } catch (err) {
      console.error('클럽 삭제 실패:', err);
      handleAlert(err.message || '클럽 삭제 중 문제가 발생했습니다.');
    }
  };
  
  const handleInviteMember = async (invitedUser) => {
    try {
      const memberRef = doc(db, 'clubs', clubId, 'members', invitedUser.uid);
      await setDoc(memberRef, {
        uid: invitedUser.uid, username: invitedUser.nickname, photoUrl: invitedUser.photo,
        role: 'member', status: 'invited', invitedAt: serverTimestamp(),
        clubId: clubId, clubName: club.name,  clubProfileUrl: club.profileUrl,
        region: club.region, ownerName: club.ownerName,
      });
      handleAlert(`${invitedUser.nickname}님을 초대했습니다.`);
      setInviteOpen(false);
    } catch (error) {
      console.error('초대 실패:', error);
      handleAlert('초대 중 오류가 발생했습니다.');
    }
  };

  const handleLeaveClub = async () => {
    // ... (기존 handleLeaveClub 로직과 동일, handleAlert 사용)
    try {
      const batch = writeBatch(db);
      const memberRef = doc(db, 'clubs', clubId, 'members', user.uid);
      batch.delete(memberRef);
      const myClubRef = doc(db, 'users', user.uid, 'myClubs', clubId);
      batch.delete(myClubRef);
      const clubRef = doc(db, 'clubs', clubId);
      batch.update(clubRef, { memberCount: increment(-1) });
      await batch.commit();
      handleAlert('클럽에서 탈퇴했습니다.');
      navigate('/clubs');
    } catch (err) {
      console.error('클럽 탈퇴 실패:', err);
      handleAlert('클럽 탈퇴 중 오류가 발생했습니다.');
    } finally {
      setLeaveOpen(false);
    }
  };

  const handleKickMember = async () => {
    // ... (기존 handleKickMember 로직과 동일, handleAlert 사용)
    if (!kickTarget) return;
    try {
        const batch = writeBatch(db);
        const memberRef = doc(db, 'clubs', clubId, 'members', kickTarget.id);
        batch.delete(memberRef);
        const myClubRef = doc(db, 'users', kickTarget.id, 'myClubs', clubId);
        batch.delete(myClubRef);
        const clubRef = doc(db, 'clubs', clubId);
        batch.update(clubRef, { memberCount: increment(-1) });
        const notificationRef = doc(collection(db, 'users', kickTarget.id, 'notifications'));
        batch.set(notificationRef, {
            type: 'kick', message: `'${club.name}' 클럽에서 강퇴되었습니다.`,
            createdAt: serverTimestamp(), isRead: false,
        });
        await batch.commit();
        handleAlert(`${kickTarget.username}님을 클럽에서 제외했습니다.`);
    } catch (err) {
        console.error('멤버 강퇴 실패:', err);
        handleAlert('멤버를 강퇴하는 중 오류가 발생했습니다.');
    } finally {
        setKickTarget(null);
    }
  };

  const handleAddSchedule = async () => {
    if (!scheduleForm.time || !scheduleForm.place) return handleAlert('시간과 장소를 입력해주세요.');
    const dataToSubmit = {
      ...scheduleForm,
      uid: user.uid,
      date: scheduleForm.date ? dayjs(scheduleForm.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      club: { id: clubId, name: club.name },
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'events'), dataToSubmit);
    await updateDoc(doc(db, 'users', user.uid), { mileage: increment(5) });
    setAddScheduleOpen(false);
    setScheduleForm({ type: '정모', place: '', date: dayjs().format('YYYY-MM-DD') });
  };

  const handleUpdateSchedule = async () => {
    // ... (기존 handleUpdateSchedule 로직과 동일)
    if (!selectedSchedule?.id) return;
    const { id, ...updateData } = selectedSchedule;
    if (updateData.date && typeof updateData.date !== 'string') {
        updateData.date = dayjs(updateData.date).format('YYYY-MM-DD');
    }
    await updateDoc(doc(db, 'events', id), updateData);
    setEditScheduleOpen(false);
  };

  const handleAddRecurringSchedule = async (recurringOptions) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    
    if (!scheduleForm.place || !endDate) {
      handleAlert('장소와 종료일을 모두 입력해주세요.');
      return;
    }

    const batch = writeBatch(db);
    const recurringId = doc(collection(db, 'events')).id; // 고유 ID 생성
    const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
    
    // 다이얼로그에서는 selectedDate가 없으므로 오늘 날짜를 기준으로 시작
    let currentDate = dayjs(); 
    const finalDate = dayjs(endDate);
    let eventCount = 0;

    const addEventToBatch = (date, time) => {
      const newEventRef = doc(collection(db, 'events'));
      const dataToSave = {
        uid: user.uid,
        type: scheduleForm.type, // '정모'
        date: date.format('YYYY-MM-DD'),
        time,
        place: scheduleForm.place,
        price: Number(monthlyPrice) || 0,
        club: { id: clubId, name: club.name }, // 클럽 정보 주입
        isRecurring: true, 
        recurringId: recurringId,
        createdAt: serverTimestamp()
      };
      batch.set(newEventRef, dataToSave);
      eventCount++;
    };

    while (currentDate.isBefore(finalDate) || currentDate.isSame(finalDate, 'day')) {
      const dayOfWeek = currentDate.day();
      
      if (dayOfWeek === dayMap[day1]) {
        addEventToBatch(currentDate, time1);
      }
      if (frequency === 2 && dayOfWeek === dayMap[day2]) {
        addEventToBatch(currentDate, time2);
      }
      currentDate = currentDate.add(1, 'day');
    }

    if (user?.uid && eventCount > 0) {
      const userRef = doc(db, 'users', user.uid);
      batch.update(userRef, { mileage: increment(eventCount * 5) });
    }

    await batch.commit();

    setAddScheduleOpen(false);
    setScheduleForm({ type: '정모', place: '', date: dayjs().format('YYYY-MM-DD') });
  };

  const handleDeleteSchedule = async () => {
    // ... (기존 handleDeleteScheduleConfirm 로직과 동일)
    if (!selectedSchedule?.id || !user?.uid) return;
    await deleteDoc(doc(db, 'events', selectedSchedule.id));
    await updateDoc(doc(db, 'users', user.uid), { mileage: increment(-(5 + (selectedSchedule.result ? 5 : 0))) });
    setDeleteScheduleOpen(false);
  };

  // 3. UI에서 사용할 값과 함수들을 객체로 반환
  return {
    // States
    editOpen, deleteOpen, inviteOpen, addPostOpen, leaveOpen, kickTarget,
    anchorEl, selectedMember, isAlertOpen, alertMessage, addScheduleOpen,
    editScheduleOpen, deleteScheduleOpen, selectedSchedule, scheduleForm,
    
    // State Setters & Handlers
    setEditOpen, setDeleteOpen, setInviteOpen, setAddPostOpen, setLeaveOpen,
    setKickTarget, setAnchorEl, setSelectedMember, setIsAlertOpen,
    setAddScheduleOpen, setEditScheduleOpen, setDeleteScheduleOpen,
    setSelectedSchedule, setScheduleForm,

    // Action Handlers
    handleUpdateClub, handleDeleteClub, 
    handleInviteMember, handleLeaveClub, handleKickMember, 
    handleAddSchedule, handleAddRecurringSchedule, handleUpdateSchedule, handleDeleteSchedule,
    handleAlert,
  };
};