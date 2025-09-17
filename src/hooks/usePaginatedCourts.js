import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { PAGE_SIZE } from '../constants/admin';

// buildQuery 함수를 훅 외부의 순수 함수로 분리
// 이 함수는 props나 state에 의존하지 않고, 오직 인자로만 동작
const buildQuery = (filters, lastDoc = null) => {
  let q = query(collection(db, 'courts'));
  const { searchType, searchTerm } = filters;

  if (searchTerm) {
    q = query(q, orderBy(searchType)); 
    q = query(q, 
      where(searchType, '>=', searchTerm),
      where(searchType, '<=', searchTerm + '\uf8ff')
    );
  } else {
    q = query(q, orderBy('name'));
  }

  if (lastDoc) {
    q = query(q, startAfter(lastDoc));
  }
  
  q = query(q, limit(PAGE_SIZE));
  return q;
};

const usePaginatedCourts = (filters) => {
  const [courts, setCourts] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        const q = buildQuery(filters);
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
  }, [filters, refreshKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      const q = buildQuery(filters, lastDoc);
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
  }, [loadingMore, hasMore, lastDoc, filters]);

  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { courts, loading, loadingMore, hasMore, loadMore, refresh };
};

export default usePaginatedCourts;