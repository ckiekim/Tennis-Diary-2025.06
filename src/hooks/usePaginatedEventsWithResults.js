import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, limit, orderBy, query, startAfter, where } from 'firebase/firestore';
import useAuthState from './useAuthState';
import { PAGE_SIZE } from '../constants/admin';

export default function usePaginatedEventsWithResults(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [courtMap, setCourtMap] = useState({});
  const { user } = useAuthState();

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

      if (isInitial) {
        eventsQuery = query(
          collection(db, 'events'),
          where('uid', '==', uid),
          where('type', 'in', ['게임', '정모']),
          orderBy('date', 'desc'),
          limit(PAGE_SIZE)
        );
      } else if (lastVisible) {
         eventsQuery = query(
          collection(db, 'events'),
          where('uid', '==', uid),
          where('type', 'in', ['게임', '정모']),
          orderBy('date', 'desc'),
          startAfter(lastVisible),
          limit(PAGE_SIZE)
        );
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
        // const q = query(resultsRef, limit(1)); // 결과는 하나만 가져옵니다.
        return getDocs(resultsRef);
      });

      // 3. 모든 'event_results' 조회를 병렬로 실행합니다.
      const resultSnapshots = await Promise.all(resultPromises);

      // 4. 'events' 데이터와 'event_results' 데이터를 조합하고, 결과가 없는 항목은 필터링합니다.
      const newItems = [];
      eventSnapshots.docs.forEach((eventDoc, index) => {
        const resultSnapshot = resultSnapshots[index];
        const eventData = { id: eventDoc.id, ...eventDoc.data() };

        // 결과가 없어도 목록에는 표시되어야 하므로 if문 밖으로 이동
        let photo = courtMap[eventData.place] || null;
        const resultCount = resultSnapshot.size; // 결과 문서의 개수를 셉니다.
        let currentUserHasSubmittedResult = false;

        let resultString = null;
        if (!resultSnapshot.empty) {
          // 대표 사진은 첫 번째 결과의 첫 번째 사진으로 설정
          const firstResultData = resultSnapshot.docs[0].data();
          if (firstResultData.photoList?.[0]) {
            photo = firstResultData.photoList[0];
          }
          // 결과가 정확히 1개일 때만 resultString에 값을 할당
          if (resultSnapshot.size === 1) {
            resultString = firstResultData.result;
          }
          // 현재 유저가 결과를 제출했는지 확인
          for (const doc of resultSnapshot.docs) {
            if (doc.data().uid === user.uid) {
              currentUserHasSubmittedResult = true;
              break;
            }
          }
        }
        
        newItems.push({ 
          ...eventData, 
          photo, 
          resultCount, // 결과 개수
          result: resultString,
          currentUserHasSubmittedResult // 내가 결과를 냈는지 여부
        });
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