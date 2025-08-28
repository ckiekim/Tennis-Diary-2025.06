import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { PAGE_SIZE } from '../constants/admin';

const usePaginatedCourts = (filters) => {
  const [courts, setCourts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // 새로고침을 위한 상태

  // 1. 필터가 변경되거나 수동 새로고침 시, 첫 페이지를 불러오는 useEffect
  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        let q = query(
          collection(db, 'courts'),
          orderBy('name'),
          limit(PAGE_SIZE)
        );

        // 필터 쿼리 추가
        if (filters.region) {
          q = query(q, 
            where('location', '>=', filters.region),
            where('location', '<=', filters.region + '\uf8ff')
          );
        }
        // 실내여부(is_indoor) 필터: Firestore의 데이터가 boolean 타입이어야 함
        if (filters.isIndoor !== '') {
          q = query(q, where('is_indoor', '==', filters.isIndoor === 'true'));
        }

        const snapshot = await getDocs(q);
        const firstPageCourts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

        setCourts(firstPageCourts);
        setLastDoc(lastVisible);
        setHasMore(snapshot.docs.length === PAGE_SIZE);

      } catch (error) {
        console.error("Error fetching first page:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPage();
  }, [filters, refreshKey]); // 의존성: filters 객체와 refreshKey

  // 2. 더 많은 데이터를 불러오는 함수 (useCallback으로 최적화)
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      let q = query(
        collection(db, 'courts'),
        orderBy('name'),
        startAfter(lastDoc),
        limit(PAGE_SIZE)
      );

      // 필터 쿼리 추가
      if (filters.region) {
        q = query(q, 
          where('location', '>=', filters.region),
          where('location', '<=', filters.region + '\uf8ff')
        );
      }
      if (filters.isIndoor !== '') {
        q = query(q, where('is_indoor', '==', filters.isIndoor === 'true'));
      }

      const snapshot = await getDocs(q);
      const newCourts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      setCourts(prev => [...prev, ...newCourts]);
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error loading more courts:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc, filters]); // 의존성: loadMore에 필요한 모든 상태

  // 3. 외부에서 목록을 새로고침할 수 있는 함수
  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { courts, loading, loadingMore, hasMore, loadMore, refresh };
};

export default usePaginatedCourts;