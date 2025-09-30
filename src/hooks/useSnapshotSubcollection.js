import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

/**
 * Firestore 서브컬렉션의 문서를 실시간으로 가져오는 커스텀 훅
 * @param {string} path - 서브컬렉션의 전체 경로 (예: 'clubs/클럽ID/members')
 * @param {object} [queryOptions] - Firestore 쿼리 옵션
 */
const useSnapshotSubcollection = (path, queryOptions = {}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orderByField, orderByDirection = 'asc' } = queryOptions;

  useEffect(() => {
    if (!path || path.split('/').length % 2 === 0) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = collection(db, path);
    const q = orderByField 
      ? query(collectionRef, orderBy(orderByField, orderByDirection))
      : query(collectionRef);

    // [수정] getDocs를 onSnapshot으로 변경
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDocuments(data);
      setLoading(false); // 데이터 로드 완료
    }, (err) => {
      console.error(`Firestore 구독 오류 (${path}):`, err);
      setDocuments([]);
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 실시간 리스너를 정리합니다. (메모리 누수 방지)
    return () => unsubscribe();

  }, [path, orderByField, orderByDirection]); // refreshKey는 더 이상 필요 없으므로 의존성 배열에서 제거

  return { documents, loading };
};

export default useSnapshotSubcollection;