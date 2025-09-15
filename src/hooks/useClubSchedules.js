import { useState, useEffect } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, orderBy, onSnapshot, query, where } from 'firebase/firestore';
import useAuthState from './useAuthState';

export default function useClubSchedules(clubId, refreshKey = 0) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthState();

  useEffect(() => {
    if (!clubId || !user) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(
      collection(db, 'events'),
      where('club.id', '==', clubId),
      orderBy('date', 'desc'),
      orderBy('time', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const schedulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Firestore에서 받아온 일정이 하나도 없을 경우,
      // 즉시 상태를 업데이트하고 로직을 종료합니다.
      if (schedulesData.length === 0) {
        setSchedules([]);
        setLoading(false);
        return; // 여기서 함수 실행을 멈춥니다.
      }

      // 각 일정별로 현재 유저가 결과를 입력했는지 확인
      const checkResultsPromises = schedulesData.map(async (schedule) => {
        const resultsRef = collection(db, 'events', schedule.id, 'event_results');
        const allResultsSnapshot = await getDocs(query(resultsRef)); // 해당 일정의 모든 결과를 가져옴
        const hasResult = !allResultsSnapshot.empty; // 결과가 하나라도 있는지 여부
        const userHasSubmitted = hasResult ? allResultsSnapshot.docs.some(doc => doc.data().uid === user.uid) : false; // 내가 낸 결과가 있는지 여부
        return { ...schedule, hasResult, userHasSubmitted };
      });

      Promise.all(checkResultsPromises).then(results => {
        setSchedules(results);
        setLoading(false);
      });
    }, (error) => {
      console.error("Error fetching club schedules: ", error);
      setLoading(false);
    });

    // Clean up the listener on component unmount or when dependencies change
    return () => unsubscribe();

  }, [clubId, user, refreshKey]); 

  return { schedules, loading };
}