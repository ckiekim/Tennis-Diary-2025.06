import { useState, useEffect } from 'react';
import { db } from '../api/firebaseConfig';
import { collectionGroup, query, where, onSnapshot } from 'firebase/firestore';

/**
 * 현재 사용자에게 온 클럽 초대 목록을 실시간으로 가져오는 훅
 * @param {string | null} userId - 현재 로그인한 사용자의 ID
 */
const useInvitations = (userId) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setInvitations([]);
      setLoading(false);
      return;
    }

    // 'members'라는 이름을 가진 모든 서브컬렉션(Collection Group)을 대상으로 쿼리
    const membersRef = collectionGroup(db, 'members');
    
    // 조건: uid 필드가 내 ID와 일치하고, status가 'invited'인 문서
    const q = query(
      membersRef, 
      where('uid', '==', userId), 
      where('status', '==', 'invited')
    );

    // onSnapshot으로 실시간 리스너 설정
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const invs = querySnapshot.docs.map(doc => ({
        id: doc.id, // 문서 ID (이 경우엔 초대받은 유저 ID와 동일)
        ...doc.data(),
      }));
      setInvitations(invs);
      setLoading(false);
    }, (error) => {
      console.error("초대 목록 실시간 수신 중 에러:", error);
      setLoading(false);
    });

    // 컴포넌트가 언마운트될 때 리스너를 정리(cleanup)합니다. (매우 중요!)
    return () => unsubscribe();

  }, [userId]);

  return { invitations, loading };
};

export default useInvitations;