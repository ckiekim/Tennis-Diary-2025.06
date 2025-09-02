import { useState, useEffect } from 'react';
import { db } from '../api/firebaseConfig';
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore';

/**
 * 사용자가 가입한 클럽 목록을 가져오는 커스텀 훅
 * @param {string | null} userId - 현재 로그인한 사용자의 ID
 */
export default function useMyClubs(uid) {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const myClubsRef = collection(db, 'users', uid, 'myClubs');
    const q = query(myClubsRef, orderBy('joinedAt', 'desc')); // 가입일 순 정렬 (예시)

    // onSnapshot 리스너 설정
    // 이 함수는 구독을 중지하는 unsubscribe 함수를 반환합니다.
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const clubsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClubs(clubsData);
        setLoading(false);
      },
      (err) => {
        console.error("myClubs 구독 실패:", err);
        setError(err);
        setLoading(false);
      }
    );

    // 컴포넌트가 언마운트될 때 구독을 해제합니다. (메모리 누수 방지)
    return () => unsubscribe();

  }, [uid]); // uid가 변경될 때만 effect를 다시 실행합니다.

  return { clubs, loading, error };
}
