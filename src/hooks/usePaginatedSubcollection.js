import { useEffect, useState, useCallback } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, query, orderBy, limit, startAfter, getDocs } from 'firebase/firestore';
import { PAGE_SIZE } from '../constants/admin';

const usePaginatedSubcollection = (collectionPath, options = {}) => {
  const { orderByField = 'createdAt', direction = 'desc', limitCount = PAGE_SIZE } = options;

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true); // 초기 로딩 상태
  const [loadingMore, setLoadingMore] = useState(false); // 추가 로딩 상태
  const [hasMore, setHasMore] = useState(true); // 더 불러올 데이터가 있는지 여부
  const [lastVisible, setLastVisible] = useState(null); // 마지막으로 불러온 문서 (페이지 기준점)
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const first = query(
        collection(db, collectionPath),
        orderBy(orderByField, direction),
        limit(limitCount)
      );
      const docSnapshots = await getDocs(first);

      const docs = docSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];

      setDocuments(docs);
      setLastVisible(lastDoc);
      setHasMore(docs.length === limitCount); // 불러온 문서 수가 limit과 같으면 더 있을 가능성이 있음
    } catch (err) {
      console.error("Error fetching initial data:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [collectionPath, orderByField, direction, limitCount]);


  // 다음 페이지 데이터를 불러오는 함수
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return; // 더 이상 데이터가 없거나 로딩 중이면 실행 방지

    setLoadingMore(true);
    setError(null);
    try {
      const next = query(
        collection(db, collectionPath),
        orderBy(orderByField, direction),
        startAfter(lastVisible), // 마지막 문서 다음부터
        limit(limitCount)
      );
      const docSnapshots = await getDocs(next);
      
      const newDocs = docSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];

      setDocuments(prevDocs => [...prevDocs, ...newDocs]); // 기존 데이터에 새로운 데이터 추가
      setLastVisible(lastDoc);
      setHasMore(newDocs.length === limitCount);
    } catch (err) {
      console.error("Error loading more data:", err);
      setError(err);
    } finally {
      setLoadingMore(false);
    }
  }, [lastVisible, hasMore, loadingMore, collectionPath, orderByField, direction, limitCount]);

  // collectionPath가 변경되면 첫 데이터를 다시 불러오도록 함
  // useState(() => {
  //   if (collectionPath) {
  //     refresh();
  //   }
  // }, [collectionPath, refresh]);
  useEffect(() => {
    // collectionPath가 유효하지 않으면 아무것도 하지 않음
    if (!collectionPath) {
      setLoading(false);
      return;
    }
    
    // cleanup 함수를 위한 플래그
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const first = query(
          collection(db, collectionPath),
          orderBy(orderByField, direction),
          limit(limitCount)
        );
        const docSnapshots = await getDocs(first);

        // 비동기 작업 완료 후, 컴포넌트가 마운트된 상태일 때만 상태 업데이트 실행
        if (isMounted) {
          const docs = docSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const lastDoc = docSnapshots.docs[docSnapshots.docs.length - 1];

          setDocuments(docs);
          setLastVisible(lastDoc);
          setHasMore(docs.length === limitCount);
        }
      } catch (err) {
        if (isMounted) {
          console.error("Error fetching initial data:", err);
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // cleanup 함수: 컴포넌트가 언마운트되면 isMounted를 false로 설정
    return () => {
      isMounted = false;
    };
  }, [collectionPath, orderByField, direction, limitCount]); // 의존성 배열 간소화

  return { documents, loading, loadingMore, hasMore, loadMore, error, refresh };
};

export default usePaginatedSubcollection;
