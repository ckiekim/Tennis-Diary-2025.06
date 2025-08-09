import { useEffect, useState } from 'react';
// import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../api/firebaseConfig';   // 추가

export default function useAuthState() {
  const [user, setUser] = useState(null);         // 로그인된 사용자 정보
  const [loading, setLoading] = useState(true);   // 초기 로딩 상태

  useEffect(() => {
    // const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe(); // 컴포넌트 언마운트 시 리스너 해제
  }, []);

  return { user, loading };
}
