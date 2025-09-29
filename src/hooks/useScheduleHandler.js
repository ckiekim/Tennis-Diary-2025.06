// useScheduleManager와 useClubDetailManager에서 공통으로 사용하는 일정 관련 코드

import { db } from '../api/firebaseConfig';
import { addDoc, collection, deleteField, doc, getDocs, increment, query, serverTimestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import { createPlaceInfo } from '../utils/handlePlaceInfo';
import { deletePhotoFromStorage } from '../api/firebaseStorage';
import { notifyAdminOfNewCourt } from '../api/adminNotificationService';
import dayjs from 'dayjs';

const useScheduleHandler = (user, selectedDate) => {
  const dayMap = { '일': 0, '월': 1, '화': 2, '수': 3, '목': 4, '금': 5, '토': 6 };

  const checkAndNotifyAdmin = async (placeInfo) => {
    // placeInfo 객체가 있고, courtId가 비어있으면 새로운 코트로 판단합니다.
    if (placeInfo && !placeInfo.courtId) {
      const userInfo = {
        uid: user.uid,
        // Firebase auth의 displayName을 사용하거나 없으면 email을 사용합니다.
        nickname: user.displayName || user.email || '익명',
      };
      await notifyAdminOfNewCourt(placeInfo.courtName, userInfo);
    }
  };

  const handleAddSchedule = async (formData) => {
    const placeInfo = createPlaceInfo(formData);
    if (!placeInfo) {
      throw new Error('장소를 입력해주세요.');
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
    await checkAndNotifyAdmin(placeInfo);
  };

  const handleAddRecurringSchedule = async (recurringOptions, formData) => {
    const { frequency, day1, time1, day2, time2, monthlyPrice, endDate } = recurringOptions;
    const placeInfo = createPlaceInfo(formData);
    if (!placeInfo || !endDate) {
      throw new Error('장소와 종료일을 모두 입력해주세요.');
    }

    const today = dayjs().startOf('day');
    const selected = dayjs(selectedDate);

    // 1. 오늘 이전 날짜를 선택했는지 확인합니다.
    if (selected.isBefore(today)) {
      throw new Error('오늘 이전 날짜에는 반복 일정을 생성할 수 없습니다.');
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
    await checkAndNotifyAdmin(placeInfo);
  };

  const handleUpdateSchedule = async (payload, recurringEditInfo) => {
    const { form, scope } = payload;
    
    if (!form?.id) return;

    const placeInfo = createPlaceInfo(form);
    if (!placeInfo) {
      throw new Error('장소 정보가 올바르지 않습니다.');
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
	  if (!recurringEditInfo) throw new Error('반복 일정 정보를 찾을 수 없습니다.');

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
    await checkAndNotifyAdmin(placeInfo);
  };

  const handleDeleteSchedule = async (scheduleToDelete, deleteAll) => {
    if (!scheduleToDelete?.id || !user?.uid) return;
    const batch = writeBatch(db);
    const userRef = doc(db, 'users', user.uid);
    if (deleteAll && scheduleToDelete.recurringId) {
      const q = query(collection(db, 'events'), where('recurringId', '==', scheduleToDelete.recurringId));
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
      const eventRef = doc(db, 'events', scheduleToDelete.id);
      const resultsRef = collection(db, 'events', scheduleToDelete.id, 'event_results');
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
  };

  // 밖에서 사용할 수 있도록 함수들을 반환
  return {
    handleAddSchedule,
    handleAddRecurringSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
  };
};

export default useScheduleHandler;