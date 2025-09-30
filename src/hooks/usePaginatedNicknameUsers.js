import { useEffect, useState, useCallback } from 'react';
import { collection, getDocs, query, orderBy, limit, startAfter, where } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import { PAGE_SIZE } from '../constants/admin';

// locationSearchText를 더 범용적인 searchText로 변경
const usePaginatedNicknameUsers = (sortBy, searchText) => {
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
        const isSearching = searchText.trim() !== '';

        if (isSearching) {
          const term = searchText.trim();
          q = query(q,
            where('nickname', '>=', term),
            where('nickname', '<=', term + '\uf8ff'),
            orderBy('nickname', 'asc')
          );
        } else {
          // 검색어가 없을 때의 정렬
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
  }, [sortBy, searchText, refreshKey]);

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !lastDoc) return;

    setLoadingMore(true);
    try {
      let q = collection(db, 'users');
      const isSearching = searchText.trim() !== '';

      if (isSearching) {
        const term = searchText.trim();
        q = query(q,
          where('nickname', '>=', term),
          where('nickname', '<=', term + '\uf8ff'),
          orderBy('nickname', 'asc')
        );
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
  }, [loadingMore, hasMore, lastDoc, sortBy, searchText]);
  
  const refresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return { users, loading, loadingMore, hasMore, loadMore, refresh };
};

export default usePaginatedNicknameUsers;