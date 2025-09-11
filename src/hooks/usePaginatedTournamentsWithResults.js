import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { PAGE_SIZE } from '../constants/admin';

export default function usePaginatedTournamentsWithResults(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  // 컴포넌트 마운트 해제 후의 상태 업데이트를 방지
  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  // --- 1. 초기 데이터 로딩을 위한 useEffect ---
  // uid나 refreshKey가 변경될 때만 실행됩니다.
  useEffect(() => {
    if (!uid) {
      setList([]);
      setLoading(false);
      return;
    }

    const fetchInitialEvents = async () => {
      setLoading(true);
      setHasMore(true); // 새로고침 시에는 다시 true로 설정

      try {
        const eventsQuery = query(
          collection(db, 'events'),
          where('uid', '==', uid),
          where('type', '==', '대회'),
          orderBy('date', 'desc'),
          limit(PAGE_SIZE)
        );

        const eventSnapshots = await getDocs(eventsQuery);
        if (!isMounted.current) return;

        if (eventSnapshots.empty) {
          setHasMore(false);
          setList([]);
          const lastDoc = eventSnapshots.docs[eventSnapshots.docs.length - 1];
          setLastVisible(lastDoc || null);
          return;
        }

        const resultPromises = eventSnapshots.docs.map(eventDoc => {
          const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
          return getDocs(query(resultsRef, limit(1)));
        });
        
        const resultSnapshots = await Promise.all(resultPromises);
        if (!isMounted.current) return;

        const newItems = eventSnapshots.docs.map((eventDoc, index) => {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          const resultSnapshot = resultSnapshots[index];
          if (!resultSnapshot.empty) {
            return { ...eventData, ...resultSnapshot.docs[0].data() };
          }
          return eventData;
        });

        setList(newItems);
        const lastDoc = eventSnapshots.docs[eventSnapshots.docs.length - 1];
        setLastVisible(lastDoc || null);
        setHasMore(eventSnapshots.docs.length === PAGE_SIZE);

      } catch (error) {
        console.error("Error fetching initial tournaments:", error);
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchInitialEvents();
  }, [uid, refreshKey]);

  // --- 2. '더보기'를 위한 fetchMore 함수 ---
  // 이 함수는 lastVisible 상태를 사용합니다.
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || !uid || !lastVisible) return;

    setLoading(true);
    try {
      const eventsQuery = query(
        collection(db, 'events'),
        where('uid', '==', uid),
        where('type', '==', '대회'),
        orderBy('date', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );

      const eventSnapshots = await getDocs(eventsQuery);
      if (!isMounted.current) return;

      if (eventSnapshots.empty) {
        setHasMore(false);
        setLoading(false);
        return;
      }
      
      const resultPromises = eventSnapshots.docs.map(eventDoc => {
        const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
        return getDocs(query(resultsRef, limit(1)));
      });

      const resultSnapshots = await Promise.all(resultPromises);
      if (!isMounted.current) return;

      const newItems = eventSnapshots.docs.map((eventDoc, index) => {
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        const resultSnapshot = resultSnapshots[index];
        if (!resultSnapshot.empty) {
          return { ...eventData, ...resultSnapshot.docs[0].data() };
        }
        return eventData;
      });

      setList(prevList => [...prevList, ...newItems]);
      const lastDoc = eventSnapshots.docs[eventSnapshots.docs.length - 1];
      setLastVisible(lastDoc || null);
      setHasMore(eventSnapshots.docs.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error fetching more tournaments:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [uid, loading, hasMore, lastVisible]);

  return { tournaments: list, loading, hasMore, fetchMore };
}