import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  collection, doc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where, writeBatch 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../api/firebaseConfig';
import useSnapshotDocument from './useSnapshotDocument';
import dayjs from 'dayjs';
import useScheduleHandler from './useScheduleHandler';
import { dayMap } from '../constants/global';

export const useClubDetailManager = (clubId, user, members, refreshSchedules) => {
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
  const [deleteAllRecurring, setDeleteAllRecurring] = useState(false);
  const [recurringEditInfo, setRecurringEditInfo] = useState(null);

  const scheduleHandler = useScheduleHandler(user);

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

  const handleAddSchedule = async (scheduleForm) => {
    try {
      const formDataWithClub = { ...scheduleForm, club: { id: clubId, name: club.name } };
      await scheduleHandler.handleAddSchedule(formDataWithClub, members);
      setAddScheduleOpen(false);
      refreshSchedules();
    } catch (error) {
      handleAlert(error.message);
    }
  };

  const handleAddRecurringSchedule = async (recurringOptions, scheduleForm) => {
    try {
      const formDataWithClub = { ...scheduleForm, club: { id: clubId, name: club.name } };
      await scheduleHandler.handleAddRecurringSchedule(recurringOptions, formDataWithClub, members);
      setAddScheduleOpen(false);
      refreshSchedules();
    } catch (error) {
      handleAlert(error.message);
    }
  };
  
  const handleEditSchedule = async (schedule) => {
    setSelectedSchedule(schedule);
    if (schedule.isRecurring && schedule.recurringId) {
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
      
      // 추론된 모든 정보로 상태를 업데이트합니다.
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
      setRecurringEditInfo(null);
    }
    setEditScheduleOpen(true);
  };

  const handleUpdateSchedule = async (payload) => {
    try {
      await scheduleHandler.handleUpdateSchedule(payload, recurringEditInfo);
      setEditScheduleOpen(false);
      refreshSchedules();
    } catch (error) {
      handleAlert(error.message);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule) return;
    try {
      await scheduleHandler.handleDeleteSchedule(selectedSchedule, deleteAllRecurring);
      setDeleteScheduleOpen(false);
      refreshSchedules();
    } catch (error) {
      handleAlert(error.message);
    }
  };

  // 3. UI에서 사용할 값과 함수들을 객체로 반환
  return {
    // States
    editOpen, deleteOpen, inviteOpen, addPostOpen, leaveOpen, kickTarget,
    anchorEl, selectedMember, isAlertOpen, alertMessage, addScheduleOpen,
    editScheduleOpen, deleteScheduleOpen, selectedSchedule, recurringEditInfo,
    
    // State Setters & Handlers
    setEditOpen, setDeleteOpen, setInviteOpen, setAddPostOpen, setLeaveOpen,
    setKickTarget, setAnchorEl, setSelectedMember, setIsAlertOpen,
    setAddScheduleOpen, setEditScheduleOpen, setDeleteScheduleOpen,
    setSelectedSchedule, setDeleteAllRecurring,

    // Action Handlers
    handleUpdateClub, handleDeleteClub, 
    handleInviteMember, handleLeaveClub, handleKickMember, 
    handleAddSchedule, handleAddRecurringSchedule, handleEditSchedule, handleUpdateSchedule, handleDeleteSchedule,
    handleAlert,
  };
};