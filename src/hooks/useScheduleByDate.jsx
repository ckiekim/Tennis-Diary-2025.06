import { useEffect, useState } from 'react';
import { auth, db } from '../api/firebaseConfig';
// import { collection, getDocs, query, where } from 'firebase/firestore';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import useAuthState from './useAuthState';
import useMyClubs from './useMyClubs';
import dayjs from 'dayjs';

const useScheduleByDate = (selectedDate, refreshKey = 0) => {
  const [schedules, setSchedules] = useState([]);
  const { user } = useAuthState();

  const { clubs: myClubs, loading: clubsLoading } = useMyClubs(user?.uid);

  useEffect(() => {
    // const user = auth.currentUser;
    if (!user || clubsLoading) {
      // setSchedules([]);
      return;
    }

    const myClubIds = myClubs.map(club => club.id);
    const mySchedulesQuery = query(
      collection(db, 'events'),
      where('date', '==', selectedDate.format('YYYY-MM-DD')),
      where('uid', '==', user.uid)
    );
    // const q = query(
    //   collection(db, 'events'),
    //   where('date', '==', selectedDate.format('YYYY-MM-DD')),
    //   where('club.id', 'in', myClubIds), // 내가 속한 클럽의 모든 일정
    //   orderBy('createdAt', 'desc')
    // );
    // const clubSchedulesQuery = myClubIds.length > 0 
    //   ? query(
    //       collection(db, 'events'),
    //       where('date', '==', selectedDate.format('YYYY-MM-DD')),
    //       where('club.id', 'in', myClubIds)
    //     )
    //   : null;

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

    // const fetchSchedules = async () => {
    //   if (!selectedDate) return;

    //   const formattedDate = dayjs(selectedDate).format('YYYY-MM-DD');
    //   const q = query(
    //     collection(db, 'events'),
    //     where('uid', '==', user.uid),
    //     where('date', '==', formattedDate)
    //   );
    //   const querySnapshot = await getDocs(q);

    //   const result = [];
    //   querySnapshot.forEach((doc) => {
    //     result.push({ id: doc.id, ...doc.data() });
    //   });

    //   setSchedules(result);
    // };

    // fetchSchedules();
  }, [selectedDate, refreshKey, user, myClubs, clubsLoading]);

  return schedules;
};

export default useScheduleByDate;
