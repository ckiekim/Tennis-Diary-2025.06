import { useState, useEffect } from 'react';
import { doc, updateDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebaseConfig'; 
import useAuthState from './useAuthState';

const useUserSettings = () => {
  const { user, loading: authLoading } = useAuthState();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNewUser, setIsNewUser] = useState(false);

  useEffect(() => {
    let unsubscribe; // 리스너를 해제하기 위한 변수

    if (user) {
      const userDocRef = doc(db, 'users', user.uid);
      unsubscribe = onSnapshot(userDocRef, 
        (docSnap) => { // 성공 콜백
          if (docSnap.exists()) {
            setSettings(docSnap.data());
            // 문서가 존재하면 신규 유저가 아님
            setIsNewUser(false);
          } else {
            // 문서가 없으면 신규 유저임
            setIsNewUser(true);
            const initialSettings = {
              email: user.email,
              nickname: user.displayName || '사용자',
              photo: user.photoURL || '',
              joinDate: new Date().toISOString().split('T')[0],
              location: '',
              createdAt: serverTimestamp(),
            };
            setDoc(userDocRef, initialSettings);
            setSettings(initialSettings);
          }
          setLoading(false);
        }, 
        (err) => { // 에러 콜백
          console.error("사용자 설정 정보 실시간 수신 실패:", err);
          setError(err);
          setLoading(false);
        }
      );
    } else if (!authLoading) {
      setLoading(false);    // 사용자가 없거나 로딩이 끝났을 때
    }

    // 클린업 함수: 컴포넌트가 언마운트될 때 리스너를 해제하여 메모리 누수 방지
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

  // 설정 정보 업데이트 함수
  const updateSettings = async (newSettings) => {
    if (!user) {
      throw new Error("사용자가 로그인되어 있지 않습니다.");
    }
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, newSettings);
    // 로컬 상태도 즉시 업데이트
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  return { settings, loading, error, isNewUser, updateSettings };
};

export default useUserSettings;