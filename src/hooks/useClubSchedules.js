import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useClubSchedules = (clubId) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clubId) {
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

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const schedulesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setSchedules(schedulesData);
      setLoading(false);
    }, (error) => {
      console.error("클럽 일정 가져오기 실패:", error);
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 실시간 리스너를 정리합니다.
    return () => unsubscribe();
  }, [clubId]);

  return { schedules, loading };
};

export default useClubSchedules;