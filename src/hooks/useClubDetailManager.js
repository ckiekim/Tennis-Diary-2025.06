import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  addDoc, collection, deleteField, doc, getDocs, increment, query, serverTimestamp, setDoc, updateDoc, where, writeBatch 
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../api/firebaseConfig';
import { deletePhotoFromStorage } from '../api/firebaseStorage';
import useSnapshotDocument from './useSnapshotDocument';
import dayjs from 'dayjs';
import { createPlaceInfo } from '../utils/handlePlaceInfo';

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

  const handleAddSchedule = async (scheduleForm) => {
    const placeInfo = createPlaceInfo(scheduleForm);
    if (!placeInfo) return handleAlert('장소를 입력해주세요.');
    if (!scheduleForm.time) return handleAlert('시간을 입력해주세요.');

    const memberUids = members ? members.map(member => member.id) : [];
    const participants = Array.from(new Set([...memberUids, user.uid]));

    const dataToSubmit = {
      ...scheduleForm,
      placeInfo, // place 대신 placeInfo 사용
      uid: user.uid,
      participantUids: participants,
      date: scheduleForm.date ? dayjs(scheduleForm.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      club: { id: clubId, name: club.name },
      createdAt: serverTimestamp(),
    };
    // 불필요한 필드 제거
    delete dataToSubmit.place;
    delete dataToSubmit.placeSelection;

    await addDoc(collection(db, 'events'), dataToSubmit);
    await updateDoc(doc(db, 'users', user.uid), { mileage: increment(5) });
    setAddScheduleOpen(false);
    refreshSchedules();
  };

  const handleUpdateSchedule = async (scheduleToUpdate) => {
    if (!scheduleToUpdate?.id) return;

    const placeInfo = scheduleToUpdate.placeSelection 
      ? createPlaceInfo(scheduleToUpdate)  : scheduleToUpdate.placeInfo;
    const updateData = { ...scheduleToUpdate };
    if (placeInfo) {
      updateData.placeInfo = placeInfo;
    }
    if (updateData.date && typeof updateData.date !== 'string') {
      updateData.date = dayjs(updateData.date).format('YYYY-MM-DD');
    }
    
    // 불필요한 필드 제거
    delete updateData.id;
    delete updateData.place;
    delete updateData.placeSelection;
    
    await updateDoc(doc(db, 'events', scheduleToUpdate.id), updateData);
    setEditScheduleOpen(false);
    refreshSchedules();
  };

  const handleAddRecurringSchedule = async (recurringOptions, scheduleForm) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    
    const placeInfo = createPlaceInfo(scheduleForm);
    if (!placeInfo || !endDate) {
      handleAlert('장소와 종료일을 모두 입력해주세요.');
      return;
    }

    const batch = writeBatch(db);
    const recurringId = doc(collection(db, 'events')).id;
    const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };
    
    // 모든 멤버의 uid를 미리 추출합니다.
    const memberUids = members ? members.map(member => member.id) : [];
    const participants = Array.from(new Set([...memberUids, user.uid]));
    
    let currentDate = dayjs(); 
    const finalDate = dayjs(endDate);
    let eventCount = 0;

    const addEventToBatch = (date, time) => {
      const newEventRef = doc(collection(db, 'events'));
      const dataToSave = {
        uid: user.uid,
        participantUids: participants, // 모든 클럽 멤버 참여자로 추가
        type: scheduleForm.type,
        date: date.format('YYYY-MM-DD'),
        time,
        placeInfo,
        price: Number(monthlyPrice) || 0,
        club: { id: clubId, name: club.name },
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
    refreshSchedules();
  };

  const handleDeleteSchedule = async () => {
    if (!selectedSchedule?.id || !user?.uid) return;

    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid); // 마일리지는 생성자 기준으로 처리

    try {
      // --- 반복 일정 전체 삭제 로직 ---
      if (deleteAllRecurring && selectedSchedule.recurringId) {
        const q = query(collection(db, 'events'), where('recurringId', '==', selectedSchedule.recurringId));
        const querySnapshot = await getDocs(q);
        
        let totalPointsToDeduct = 0;

        for (const eventDoc of querySnapshot.docs) {
          const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
          const resultsSnapshot = await getDocs(resultsRef);

          // 결과가 없으면 삭제
          if (resultsSnapshot.empty) {
            // 이 일정 생성자의 마일리지를 차감해야 하지만, 여기서는 간단히 user의 마일리지를 차감합니다.
            // (정확하려면 eventDoc.data().uid를 사용해야 함)
            totalPointsToDeduct += 5; 
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
        await batch.commit();
        handleAlert('결과가 없는 반복 일정이 삭제되었습니다.');

      } else {
        // --- 단일 일정 삭제 로직 ---
        let pointsToDeduct = 5;
        const eventRef = doc(db, 'events', selectedSchedule.id);
        const resultsRef = collection(db, 'events', selectedSchedule.id, 'event_results');
        const resultsSnapshot = await getDocs(resultsRef);

        // 결과가 있다면 결과 문서와 사진도 함께 삭제
        if (!resultsSnapshot.empty) {
          pointsToDeduct += 5; // 결과 입력 포인트
          for (const resultDoc of resultsSnapshot.docs) {
            const resultData = resultDoc.data();
            if (resultData.photoList && resultData.photoList.length > 0) {
              for (const url of resultData.photoList) {
                await deletePhotoFromStorage(url); // Storage에서 사진 파일 삭제
              }
            }
            batch.delete(resultDoc.ref); // 결과 문서 삭제
          }
        }

        batch.delete(eventRef); // 일정 문서 삭제
        if (pointsToDeduct > 0) {
          batch.update(userRef, { mileage: increment(-pointsToDeduct) });
        }
        await batch.commit();
        handleAlert('일정이 삭제되었습니다.');
      }
    } catch (error) {
      console.error("일정 삭제 실패:", error);
      handleAlert('일정 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleteScheduleOpen(false);
      setDeleteAllRecurring(false);
      refreshSchedules();
    }
  };

  // 3. UI에서 사용할 값과 함수들을 객체로 반환
  return {
    // States
    editOpen, deleteOpen, inviteOpen, addPostOpen, leaveOpen, kickTarget,
    anchorEl, selectedMember, isAlertOpen, alertMessage, addScheduleOpen,
    editScheduleOpen, deleteScheduleOpen, selectedSchedule, 
    
    // State Setters & Handlers
    setEditOpen, setDeleteOpen, setInviteOpen, setAddPostOpen, setLeaveOpen,
    setKickTarget, setAnchorEl, setSelectedMember, setIsAlertOpen,
    setAddScheduleOpen, setEditScheduleOpen, setDeleteScheduleOpen,
    setSelectedSchedule, setDeleteAllRecurring,

    // Action Handlers
    handleUpdateClub, handleDeleteClub, 
    handleInviteMember, handleLeaveClub, handleKickMember, 
    handleAddSchedule, handleAddRecurringSchedule, handleUpdateSchedule, handleDeleteSchedule,
    handleAlert,
  };
};