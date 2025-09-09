import { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';
import useAuthState from './useAuthState';
import useMyClubs from './useMyClubs';

const useEventDateMap = (refreshKey = 0) => {
  const [eventDateMap, setEventDateMap] = useState({});
  const { user } = useAuthState();
  const { clubs: myClubs, loading: clubsLoading } = useMyClubs(user?.uid);

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
      const newMap = {};
      uniqueEvents.forEach((event) => {
        if (event.date && event.type) {
          if (!newMap[event.date]) {
            newMap[event.date] = [];
          }
          newMap[event.date].push(event.type);
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