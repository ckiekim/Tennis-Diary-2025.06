import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { PAGE_SIZE } from '../constants/admin';

export default function usePaginatedEventsWithResults(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [courtMap, setCourtMap] = useState({});

  // 컴포넌트 마운트 해제 후 상태 업데이트를 방지하기 위한 참조
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
      setCourtMap(newCourtMap);
    };
    fetchCourtData();
  }, []);

  // 데이터 로딩 함수 (초기 로드와 추가 로드 모두 사용)
  const fetchEvents = useCallback(async (isInitial = false) => {
    if (!uid || Object.keys(courtMap).length === 0) {
      setList([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);

    try {
      // 1. 'events' 컬렉션에서 기본 데이터를 페이지네이션하여 가져옵니다.
      let eventsQuery = query(
        collection(db, 'events'),
        where('uid', '==', uid),
        where('type', 'in', ['게임', '정모']),
        orderBy('date', 'desc'),
        limit(PAGE_SIZE)
      );

      if (!isInitial && lastVisible) {
        eventsQuery = query(eventsQuery, startAfter(lastVisible));
      }

      const eventSnapshots = await getDocs(eventsQuery);
      if (eventSnapshots.empty) {
        if (isMounted.current) {
          setHasMore(false);
          setLoading(false);
        }
        return;
      }

      // 2. 가져온 각 'event'에 대해 'event_results' 하위 컬렉션 조회를 준비합니다.
      const resultPromises = eventSnapshots.docs.map(eventDoc => {
        const resultsRef = collection(db, 'events', eventDoc.id, 'event_results');
        const q = query(resultsRef, limit(1)); // 결과는 하나만 가져옵니다.
        return getDocs(q);
      });

      // 3. 모든 'event_results' 조회를 병렬로 실행합니다.
      const resultSnapshots = await Promise.all(resultPromises);

      // 4. 'events' 데이터와 'event_results' 데이터를 조합하고, 결과가 없는 항목은 필터링합니다.
      const newItems = [];
      eventSnapshots.docs.forEach((eventDoc, index) => {
        const resultSnapshot = resultSnapshots[index];
        // 결과 데이터가 있는 event만 목록에 추가합니다.
        if (!resultSnapshot.empty) {
          const eventData = { id: eventDoc.id, ...eventDoc.data() };
          const resultData = resultSnapshot.docs[0].data();
          // photoList의 첫 사진을 대표 사진으로 사용. 없으면 코트 사진
          const photo = resultData.photoList?.[0] || courtMap[eventData.place] || null;

          newItems.push({ ...eventData, ...resultData, photo });
        }
      });
      
      if (isMounted.current) {
        // 5. 상태를 업데이트합니다.
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
  }, [uid, lastVisible, courtMap]);

  // uid나 refreshKey가 변경되면, 상태를 초기화하고 첫 페이지부터 다시 로드합니다.
  useEffect(() => {
    setList([]);
    setLastVisible(null);
    setHasMore(true);
    fetchEvents(true);
	// eslint-disable-next-line
  }, [uid, refreshKey]);

  // 외부에서 호출할 '더 불러오기' 함수
  const fetchMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchEvents(false);
  }, [loading, hasMore, fetchEvents]);

  return { results: list, loading, hasMore, fetchMore };
}