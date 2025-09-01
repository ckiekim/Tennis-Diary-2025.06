import { useState, useEffect } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';

/**
 * 사용자가 가입한 클럽 목록을 가져오는 커스텀 훅
 * @param {string | null} userId - 현재 로그인한 사용자의 ID
 */
export const useMyClubs = (userId, refreshKey = 0) => {
  const [clubs, setClubs] = useState([]); // 클럽 목록 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 상태

  useEffect(() => {
    // userId가 없으면(로그아웃 상태 등) 아무 작업도 하지 않음
    if (!userId) {
      setClubs([]);
      setLoading(false);
      return;
    }

    const fetchClubs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Firestore에서 데이터 가져오기
        // 경로: users/{userId}/myClubs
        const myClubsCollectionRef = collection(db, 'users', userId, 'myClubs');
        
        // (선택사항) 클럽 이름순으로 정렬하려면 query를 사용합니다.
        const q = query(myClubsCollectionRef, orderBy('clubName'));

        const querySnapshot = await getDocs(q);

        // 가져온 데이터를 React에서 사용하기 좋은 배열 형태로 변환
        const clubsData = querySnapshot.docs.map(doc => ({
          id: doc.id, // 문서 ID를 id 필드에 추가 (clubId가 됨)
          ...doc.data(),
        }));

        setClubs(clubsData);

      } catch (err) {
        console.error("클럽 목록을 가져오는 중 에러 발생:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchClubs();

  }, [userId, refreshKey]); 

  return { clubs, loading, error };
};
