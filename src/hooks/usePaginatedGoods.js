import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { PAGE_SIZE } from '../constants/global';

const usePaginatedGoods = (uid, refreshKey = 0) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [lastVisible, setLastVisible] = useState(null);

  const fetchMore = useCallback(async () => {
    if (!uid || loading || !hasMore) return;

    setLoading(true);
    try {
      const goodsRef = collection(db, 'goods');
      // lastVisible을 기준으로 다음 페이지 쿼리
      const q = query(
        goodsRef, where('uid', '==', uid), orderBy('date', 'desc'), startAfter(lastVisible), limit(PAGE_SIZE)
      );

      const snapshot = await getDocs(q);
      const newItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const lastDoc = snapshot.docs[snapshot.docs.length - 1];
      setLastVisible(lastDoc);

      if (snapshot.docs.length < PAGE_SIZE) {
        setHasMore(false);
      }
      
      setGoods(prevGoods => [...prevGoods, ...newItems]);

    } catch (error) {
      console.error("Error fetching more goods:", error);
    } finally {
      setLoading(false);
    }
  }, [uid, loading, hasMore, lastVisible]);


  // '초기 로드' 또는 '새로고침' 로직: useEffect 사용
  useEffect(() => {
    const fetchInitialGoods = async () => {
      if (!uid) {
        setGoods([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setHasMore(true); // 새로고침 시에는 더 불러올 데이터가 있을 수 있으므로 true로 초기화

      try {
        const goodsRef = collection(db, 'goods');
        const q = query(    // 첫 페이지 쿼리
          goodsRef, where('uid', '==', uid), orderBy('date', 'desc'), limit(PAGE_SIZE)
        );

        const snapshot = await getDocs(q);
        const initialItems = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        const lastDoc = snapshot.docs[snapshot.docs.length - 1];
        setLastVisible(lastDoc);

        if (snapshot.docs.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setGoods(initialItems); // 기존 데이터를 덮어쓰기
      } catch (error) {
        console.error("Error fetching initial goods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialGoods();
  }, [uid, refreshKey]);

  return { goods, loading, hasMore, fetchMore };
};

export default usePaginatedGoods;
