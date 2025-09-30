import { useState, useEffect, useCallback } from 'react';
import { db } from '../../api/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { PAGE_SIZE } from '../../constants/admin'; 

export default function usePaginatedGames(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);
  const [courtMap, setCourtMap] = useState({});

  // 코트 정보는 한 번만 불러와서 재사용.
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

  useEffect(() => {
    // uid나 courtMap이 준비되지 않았으면 실행하지 않습니다.
    if (!uid || !Object.keys(courtMap).length) {
      setList([]);
      setLoading(false);
      return;
    }

    const fetchInitialResults = async () => {
      setLoading(true);
      setHasMore(true); // 새로고침 시에는 다시 true로 설정

      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('uid', '==', uid),
          where('type', 'in', ['게임', '정모']),
          orderBy('date', 'desc'),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const initialItems = [];
        snapshot.forEach(d => {
          const data = d.data();
          if (data.result) {
            initialItems.push({ id: d.id, ...data, photo: courtMap[data.place] || '' });
          }
        });

        setList(initialItems);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);
        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching initial results:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialResults();
  }, [uid, refreshKey, courtMap]); // uid, refreshKey, courtMap이 변경될 때만 실행

  // 추가 데이터 로드 로직
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || !uid || !lastVisible) return;

    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('uid', '==', uid),
        where('type', '==', '게임'),
        orderBy('date', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newItems = [];
      snapshot.forEach(d => {
        const data = d.data();
        if (data.result) {
          newItems.push({ id: d.id, ...data, photo: courtMap[data.place] || '' });
        }
      });
      
      setList(prevList => [...prevList, ...newItems]);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more results:", error);
    } finally {
      setLoading(false);
    }
  }, [uid, loading, hasMore, lastVisible, courtMap]);

  return { results: list, loading, hasMore, fetchMore };
}
