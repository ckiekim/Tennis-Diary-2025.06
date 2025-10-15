import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { PAGE_SIZE } from '../constants/global';

const usePaginatedUsers = (sortBy, locationSearchText) => {
  const [users, setUsers] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const fetchFirstPage = async () => {
      setLoading(true);
      try {
        let q = collection(db, 'users');
        const isSearching = locationSearchText.trim() !== '';

        if (isSearching) {
          const searchText = locationSearchText.trim();
          // 지역 검색 시, location으로 먼저 정렬해야 함
          q = query(q,
            where('location', '>=', searchText),
            where('location', '<=', searchText + '\uf8ff'),
            orderBy('location', 'asc')
          );
          // 그 다음, 사용자가 선택한 기준으로 2차 정렬
          if (sortBy === 'nickname') {
            q = query(q, orderBy('nickname', 'asc'));
          } else if (sortBy === 'mileage') { 
            q = query(q, orderBy('mileage', 'desc'));
          } else {
            q = query(q, orderBy('joinDate', 'desc'));
          }
        } else {
          // 검색어가 없을 때는 기존 정렬 방식 사용
          if (sortBy === 'nickname') {
            q = query(q, orderBy('nickname', 'asc'));
          } else if (sortBy === 'mileage') {
            q = query(q, orderBy('mileage', 'desc'));
          } else {
            q = query(q, orderBy('joinDate', 'desc'));
          }
        }

        q = query(q, limit(PAGE_SIZE));

        const snapshot = await getDocs(q);
        const firstPageUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
        const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

        setUsers(firstPageUsers);
        setLastDoc(lastVisible);
        setHasMore(snapshot.docs.length === PAGE_SIZE);

      } catch (error) {
        console.error("Error fetching first page of users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFirstPage();
  }, [sortBy, locationSearchText, refreshKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      let q = collection(db, 'users');
      const isSearching = locationSearchText.trim() !== '';

      if (isSearching) {
        const searchText = locationSearchText.trim();
        q = query(q,
          where('location', '>=', searchText),
          where('location', '<=', searchText + '\uf8ff'),
          orderBy('location', 'asc')
        );
        if (sortBy === 'nickname') {
          q = query(q, orderBy('nickname', 'asc'));
        } else if (sortBy === 'mileage') { 
          q = query(q, orderBy('mileage', 'desc'));
        } else {
          q = query(q, orderBy('joinDate', 'desc'));
        }
      } else {
        if (sortBy === 'nickname') {
          q = query(q, orderBy('nickname', 'asc'));
        } else if (sortBy === 'mileage') {
          q = query(q, orderBy('mileage', 'desc'));
        } else {
          q = query(q, orderBy('joinDate', 'desc'));
        }
      }

      q = query(q, startAfter(lastDoc), limit(PAGE_SIZE));

      const snapshot = await getDocs(q);
      const newUsers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
      const lastVisible = snapshot.docs[snapshot.docs.length - 1] || null;

      setUsers(prev => [...prev, ...newUsers]);
      setLastDoc(lastVisible);
      setHasMore(snapshot.docs.length === PAGE_SIZE);

    } catch (error) {
      console.error("Error loading more users:", error);
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore, lastDoc, sortBy, locationSearchText]);
  
  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { users, loading, loadingMore, hasMore, loadMore, refresh };
};

export default usePaginatedUsers;
