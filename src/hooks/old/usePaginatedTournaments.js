import { useState, useEffect, useCallback } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, where, orderBy, limit, startAfter } from 'firebase/firestore';
import { PAGE_SIZE } from '../constants/admin';

export default function usePaginatedTournaments(uid, refreshKey = 0) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  // 초기 로드 또는 새로고침 로직
  useEffect(() => {
    if (!uid) {
      setList([]);
      setLoading(false);
      return;
    }

    const fetchInitialTournaments = async () => {
      setLoading(true);
      setHasMore(true);

      try {
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('uid', '==', uid),
          where('type', '==', '대회'),
          orderBy('date', 'desc'),
          limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const initialItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setList(initialItems);
        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);
        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching initial tournaments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialTournaments();
  }, [uid, refreshKey]);

  // 추가 데이터 로드 로직
  const fetchMore = useCallback(async () => {
    if (loading || !hasMore || !uid || !lastVisible) return;

    setLoading(true);
    try {
      const eventsRef = collection(db, 'events');
      const q = query(
        eventsRef,
        where('uid', '==', uid),
        where('type', '==', '대회'),
        orderBy('date', 'desc'),
        startAfter(lastVisible),
        limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setList(prevList => [...prevList, ...newItems]);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);
      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more tournaments:", error);
    } finally {
      setLoading(false);
    }
  }, [uid, loading, hasMore, lastVisible]);

  return { tournaments: list, loading, hasMore, fetchMore };
}
