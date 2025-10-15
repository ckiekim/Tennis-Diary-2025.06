import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import useAuthState from './useAuthState';
import { PAGE_SIZE } from '../constants/global';

export default function usePaginatedEventsWithResults(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [courtMap, setCourtMap] = useState({});
  const { user } = useAuthState();

  const isMounted = useRef(true);
  useEffect(() => {
    isMounted.current = true;
    return () => { isMounted.current = false; };
  }, []);

  useEffect(() => {
    const fetchCourtData = async () => {
      const courtSnap = await getDocs(collection(db, 'courts'));
      const newCourtMap = {};
      courtSnap.forEach(d => {
        const { name, photo } = d.data();
        newCourtMap[name] = photo || '';
      });
      if (isMounted.current) {
        setCourtMap(newCourtMap);
      }
    };
    fetchCourtData();
  }, []);

  const fetchEvents = useCallback(async (isInitial = false) => {
    // 이제 이 함수는 uid와 courtMap이 보장된 상태에서 호출되므로, 시작 부분의 조건문은 남겨두어도 안전
    if (!uid || Object.keys(courtMap).length === 0) {
      setList([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      const baseQueryConstraints = [
        where('participantUids', 'array-contains', uid),
        where('type', 'in', ['게임', '정모']),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE)
      ];

      let eventsQuery;
      if (isInitial) {
        eventsQuery = query(collection(db, 'events'), ...baseQueryConstraints);
      } else if (lastVisible) {
        eventsQuery = query(collection(db, 'events'), ...baseQueryConstraints, startAfter(lastVisible));
      } else {
        setLoading(false);
        setHasMore(false);
        return;
      }

      const eventSnapshots = await getDocs(eventsQuery);

      if (eventSnapshots.empty) {
        if (isMounted.current) {
          if (isInitial) setList([]); // 초기 로드 시 비어있으면 목록을 비워줍니다.
          setHasMore(false);
        }
        return;
      }
      
      const resultPromises = eventSnapshots.docs.map(eventDoc => {
        const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
        return getDocs(resultsRef);
      });
      const resultSnapshots = await Promise.all(resultPromises);

      const newItems = [];
      eventSnapshots.docs.forEach((eventDoc, index) => {
        const resultSnapshot = resultSnapshots[index];
        const eventData = { id: eventDoc.id, ...eventDoc.data() };
        let photo = courtMap[eventData.place] || null;
        const resultCount = resultSnapshot.size;
        let currentUserHasSubmittedResult = false;
        let resultString = null;

        if (!resultSnapshot.empty) {
          const firstResultData = resultSnapshot.docs[0].data();
          if (firstResultData.photoList?.[0]) { photo = firstResultData.photoList[0]; }
          if (resultSnapshot.size === 1) { resultString = firstResultData.result; }
          for (const doc of resultSnapshot.docs) {
            if (doc.data().uid === user.uid) { currentUserHasSubmittedResult = true; break; }
          }
        }
        newItems.push({ ...eventData, photo, resultCount, result: resultString, currentUserHasSubmittedResult });
      });
      
      if (isMounted.current) {
        setList(prevList => isInitial ? newItems : [...prevList, ...newItems]);
        const lastDoc = eventSnapshots.docs[eventSnapshots.docs.length - 1];
        setLastVisible(lastDoc);
        setHasMore(eventSnapshots.docs.length === PAGE_SIZE);
      }

    } catch (error) {
      console.error("Error fetching paginated events with results:", error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [uid, lastVisible, courtMap, user?.uid]);

  useEffect(() => {
    // uid와 courtMap이 모두 준비되었을 때만 초기 로딩을 시작
    if (uid && Object.keys(courtMap).length > 0) {
      setList([]);
      setLastVisible(null);
      setHasMore(true);
      fetchEvents(true);
    } else {
      // 아직 준비가 안됐을 경우, 로딩 상태를 유지
      setList([]);
      setLoading(true);
    }
	// eslint-disable-next-line
  }, [uid, refreshKey, courtMap]); // 의존성 배열에 courtMap 추가

  const fetchMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchEvents(false);
  }, [loading, hasMore, fetchEvents]);

  return { results: list, loading, hasMore, fetchMore };
}