import { useState, useEffect, useCallback } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, query, where, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import useAuthState from './useAuthState';
import dayjs from 'dayjs';

const SCHEDULE_PAGE_SIZE = 3;

export default function usePaginatedClubSchedules(clubId, refreshKey = 0) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuthState();

  // 각 일정의 상세 정보(결과 여부 등)를 가져오는 헬퍼 함수
  const fetchScheduleDetails = useCallback(async (schedulesData) => {
    if (!user) return schedulesData;
    
    return Promise.all(
      schedulesData.map(async (schedule) => {
        const resultsRef = collection(db, 'events', schedule.id, 'event_results');
        const allResultsSnapshot = await getDocs(query(resultsRef));
        
        const hasResult = !allResultsSnapshot.empty;
        const userHasSubmitted = hasResult ? allResultsSnapshot.docs.some(doc => doc.data().uid === user.uid) : false;

        return { ...schedule, hasResult, userHasSubmitted };
      })
    );
  }, [user]);

  // 첫 페이지 로딩/새로고침 전용 useEffect
  useEffect(() => {
    const fetchInitialSchedules = async () => {
      if (!clubId || !user) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setHasMore(true);

      try {
        const today = dayjs().format('YYYY-MM-DD');
        const q = query(
          collection(db, 'events'),
          where('club.id', '==', clubId),
          where('date', '>=', today),
          orderBy('date', 'asc'),
          orderBy('time', 'asc'),
          limit(SCHEDULE_PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const newSchedulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const detailedSchedules = await fetchScheduleDetails(newSchedulesData);

        setSchedules(detailedSchedules);
        setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        setHasMore(snapshot.docs.length === SCHEDULE_PAGE_SIZE);

      } catch (error) {
        console.error("Error fetching initial club schedules: ", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialSchedules();
  }, [clubId, user, refreshKey, fetchScheduleDetails]); // user와 fetchScheduleDetails 추가

  // '더보기' 전용 useCallback 함수
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastVisible) return;

    setLoadingMore(true);
    try {
      const today = dayjs().format('YYYY-MM-DD');
      const q = query(
        collection(db, 'events'),
        where('club.id', '==', clubId),
        where('date', '>=', today),
        orderBy('date', 'asc'),
        orderBy('time', 'asc'),
        startAfter(lastVisible), // 마지막 문서부터 이어서
        limit(SCHEDULE_PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newSchedulesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const detailedSchedules = await fetchScheduleDetails(newSchedulesData);
      
      setSchedules(prev => [...prev, ...detailedSchedules]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === SCHEDULE_PAGE_SIZE);

    } catch (error) {
      console.error("Error fetching more club schedules: ", error);
    } finally {
      setLoadingMore(false);
    }
  }, [clubId, hasMore, lastVisible, loadingMore, fetchScheduleDetails]); // 필요한 모든 의존성 명시

  return { 
    schedules, 
    loading, 
    loadingMore, 
    hasMore, 
    loadMore
  };
}