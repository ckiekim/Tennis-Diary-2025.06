import { useEffect, useState, useCallback } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import useAuthState from './useAuthState';
import useMyClubs from './useMyClubs';

const useEventDateMap = (refreshKey = 0) => {
  const [eventDateMap, setEventDateMap] = useState({});
  const { user } = useAuthState();
  const { clubs: myClubs, loading: clubsLoading } = useMyClubs(user?.uid);

  // useEffect(() => {
  //   const user = auth.currentUser;
  //   if (!user) {
  //     setEventDateMap({});
  //     return;
  //   }

  //   const fetchEventDates = async () => {
  //     const q = query(collection(db, 'events'), where('uid', '==', user.uid));
  //     const querySnapshot = await getDocs(q);
  //     const map = {};

  //     querySnapshot.forEach((doc) => {
  //       const event = doc.data();
  //       if (event.date) {
  //         if (!map[event.date])
  //           map[event.date] = [];
  //         map[event.date].push(event.type);
  //       }
  //     });
  //     setEventDateMap(map);
  //   };

  //   fetchEventDates();
  // // }, [auth.currentUser, refreshKey]);
  // }, [refreshKey]);

  const fetchEventDates = useCallback(async () => {
    if (!user || clubsLoading) {
      return;
    }

    try {
      const myClubIds = myClubs.map(club => club.id);
      const queriesToRun = [];

      const myEventsQuery = query(collection(db, 'events'), where('uid', '==', user.uid));
      queriesToRun.push(getDocs(myEventsQuery));

      if (myClubIds.length > 0) {
        const clubEventsQuery = query(collection(db, 'events'), where('club.id', 'in', myClubIds));
        queriesToRun.push(getDocs(clubEventsQuery));
      }
      
      const snapshots = await Promise.all(queriesToRun);
      
      let allEvents = [];
      snapshots.forEach(snapshot => {
        const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        allEvents = allEvents.concat(events);
      });

      const uniqueEvents = Array.from(new Map(allEvents.map(event => [event.id, event])).values());
      
      // =================================================================
      // ===               여기에 로그를 추가했습니다                 ===
      // =================================================================
      console.log('[디버깅] 최종 일정 데이터 확인:', uniqueEvents);
      
      const newMap = {};
      uniqueEvents.forEach((event) => {
        if (event.date) {
          newMap[event.date] = true;
        }
      });
      
      setEventDateMap(newMap);

    } catch (error) {
      console.error('[디버깅] 이벤트 날짜 조회 중 에러 발생:', error);
      setEventDateMap({});
    }
  }, [user, myClubs, clubsLoading]);

  useEffect(() => {
    fetchEventDates();
  }, [fetchEventDates, refreshKey]);

  return eventDateMap;
};

export default useEventDateMap;