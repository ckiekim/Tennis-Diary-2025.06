import { useState, useEffect } from 'react';
import { collection, getDocs, orderBy, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import useAuthState from './useAuthState';

const useClubSchedules = (clubId) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthState();

  useEffect(() => {
    if (!clubId || !user) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    // 'events' 컬렉션에서 'club.id' 필드가 현재 clubId와 일치하는 문서들을 찾습니다.
    // 날짜 오름차순으로 정렬합니다.
    const q = query(
      collection(db, 'events'),
      where('club.id', '==', clubId),
      orderBy('date', 'asc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => { // 콜백을 async 함수로 변경
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // 각 일정의 결과 정보를 추가로 가져오는 로직 ---
      const schedulesWithResultInfo = await Promise.all(schedulesData.map(async (schedule) => {
        const resultsRef = collection(db, 'events', schedule.id, 'event_results');
        const resultsSnapshot = await getDocs(resultsRef);

        let hasResult = false;
        let currentUserHasSubmittedResult = false;

        if (!resultsSnapshot.empty) {
          hasResult = true; // 결과가 하나라도 있으면 true
          // 결과 목록을 순회하며 현재 사용자가 쓴 글이 있는지 확인
          for (const doc of resultsSnapshot.docs) {
            if (doc.data().uid === user.uid) {
              currentUserHasSubmittedResult = true;
              break; // 찾았으면 더 이상 순회할 필요 없음
            }
          }
        }

        return { ...schedule, hasResult, currentUserHasSubmittedResult };
      }));
      setSchedules(schedulesWithResultInfo);
      setLoading(false);
    }, (error) => {
      console.error("클럽 일정 가져오기 실패:", error);
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 실시간 리스너를 정리합니다.
    return () => unsubscribe();
  }, [clubId, user]);

  return { schedules, loading };
};

export default useClubSchedules;