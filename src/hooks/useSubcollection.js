import { useEffect, useState } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

/**
 * Firestore 서브컬렉션의 모든 문서를 가져오는 커스텀 훅
 * @param {string} path - 서브컬렉션의 전체 경로 (예: 'clubs/클럽ID/members')
 * @param {object} [queryOptions] - Firestore 쿼리 옵션 (예: { orderByField: 'createdAt', orderByDirection: 'desc' })
 * @param {number} [refreshKey=0] - 이 값이 변경되면 데이터를 다시 불러옵니다.
 */
const useSubcollection = (path, queryOptions = {}, refreshKey = 0) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const { orderByField, orderByDirection = 'asc' } = queryOptions;

  useEffect(() => {
    // 경로(path)는 '컬렉션/문서/컬렉션'과 같이 홀수 개의 세그먼트로 이루어져야 합니다.
    if (!path || path.split('/').length % 2 === 0) {
      setDocuments([]);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const collectionRef = collection(db, path);
        const q = orderByField 
          ? query(collectionRef, orderBy(orderByField, orderByDirection))
          : query(collectionRef);

        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        setDocuments(data);
      } catch (err) {
        console.error(`Firestore 읽기 오류 (${path}):`, err);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, orderByField, orderByDirection, refreshKey]);

  return { documents, loading };
};

export default useSubcollection;