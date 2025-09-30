import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import useAuthState from './useAuthState';
import useMyClubs from './useMyClubs';

const useScheduleByDate = (selectedDate, refreshKey = 0) => {
  const [schedules, setSchedules] = useState([]);
  const { user } = useAuthState();

  const { clubs: myClubs, loading: clubsLoading } = useMyClubs(user?.uid);

  useEffect(() => {
    if (!user || clubsLoading) {
      setSchedules([]);
      return;
    }

    const myClubIds = myClubs.map(club => club.id);
    const mySchedulesQuery = query(
      collection(db, 'events'),
      where('date', '==', selectedDate.format('YYYY-MM-DD')),
      where('uid', '==', user.uid)
    );

    const unsubscribeMySchedules = onSnapshot(mySchedulesQuery, mySnapshot => {
      const mySchedules = mySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 클럽 일정 쿼리를 실행해야 하는 경우
      if (myClubIds.length > 0) {
        const clubSchedulesQuery = query(
          collection(db, 'events'),
          where('date', '==', selectedDate.format('YYYY-MM-DD')),
          where('club.id', 'in', myClubIds)
        );

        const unsubscribeClubSchedules = onSnapshot(clubSchedulesQuery, clubSnapshot => {
          const clubSchedules = clubSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          // 결과 합치기 및 중복 제거
          const combined = [...mySchedules, ...clubSchedules];
          const uniqueSchedules = Array.from(new Set(combined.map(s => s.id)))
            .map(id => combined.find(s => s.id === id));
          
          uniqueSchedules.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
          setSchedules(uniqueSchedules);
        });
        
        // cleanup 함수에 club 리스너의 구독 취소도 포함
        return () => unsubscribeClubSchedules();
      } else {
        // 클럽이 없으면 개인 일정만으로 상태를 설정하고 종료
        setSchedules(mySchedules);
      }
    });
    
    // 컴포넌트 언마운트 시 개인 일정 리스너 구독 취소
    return () => unsubscribeMySchedules();

  }, [selectedDate, refreshKey, user, myClubs, clubsLoading]);

  return schedules;
};

export default useScheduleByDate;
