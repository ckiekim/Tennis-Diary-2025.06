import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../api/firebaseConfig'; 
import useAuthState from './useAuthState';

const useUserSettings = () => {
  const { user, loading: authLoading } = useAuthState();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(userDocRef);

        if (docSnap.exists()) {
          // 문서가 존재하면 해당 데이터로 상태 설정
          setSettings(docSnap.data());
        } else {
          // 문서가 없으면 (최초 로그인) 초기값으로 문서를 생성
          const initialSettings = {
            email: user.email,
            nickname: user.displayName || '사용자',
            photo: user.photoURL || '',
            joinDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD 형식
            location: '', // 지역 정보는 초기에 비워둠
            createdAt: serverTimestamp(), // 생성 타임스탬프
          };
          await setDoc(userDocRef, initialSettings);
          setSettings(initialSettings);
        }
      } catch (err) {
        console.error("사용자 설정 정보 로딩 실패:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchSettings();
    }
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

  return { settings, loading, error, updateSettings };
};

export default useUserSettings;