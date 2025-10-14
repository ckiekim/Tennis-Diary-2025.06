import { useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../api/firebaseConfig'; 
import useAuthState from './useAuthState';

const useUserSettings = () => {
  const { user, loading: authLoading } = useAuthState();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // 1. 인증 상태 로딩이 진행 중이면, 아무것도 하지 않고 기다립니다.
    if (authLoading) {
      setLoading(true);
      return;
    }

    // 2. 인증 로딩이 끝났는데 사용자가 없으면 (로그아웃 상태), 모든 상태를 초기화하고 종료합니다.
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    // 3. 인증이 완료된 사용자가 있으면, 해당 사용자의 문서를 구독합니다.
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          // 문서가 있으면 settings 상태를 업데이트합니다.
          setSettings(docSnap.data());
        } else {
          // 문서가 없으면 null로 설정합니다. (신규 유저 처리는 다른 곳에서 담당)
          setSettings(null);
        }
        setLoading(false); // 데이터 수신이 완료되면 로딩 상태를 false로 변경
      },
      (err) => {
        console.error("사용자 설정 정보 수신 실패:", err);
        setError(err);
        setLoading(false);
      }
    );

    // 클린업 함수: 컴포넌트가 언마운트될 때 구독을 해제합니다.
    return () => unsubscribe();

  }, [user, authLoading]); // user나 authLoading 상태가 변경될 때마다 이 로직이 다시 실행됩니다.

  // 설정 정보 업데이트 함수 (기존 로직 유지)
  const updateSettings = async (newSettings) => {
    if (!user) {
      throw new Error("사용자가 로그인되어 있지 않습니다.");
    }
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, newSettings);
    // 로컬 상태도 즉시 업데이트하여 UI에 빠르게 반영
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // isNewUser 로직은 AuthGuard에서 settings가 null인지 여부로 판단하는 것이 더 안정적입니다.
  const isNewUser = !loading && user && !settings;

  return { settings, loading, error, isNewUser, updateSettings };
};

export default useUserSettings;