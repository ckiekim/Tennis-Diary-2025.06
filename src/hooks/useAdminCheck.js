import { useEffect, useState } from 'react';
import useAuthState from './useAuthState';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../api/firebaseConfig';

export default function useAdminCheck() {
  const { user, loading: authLoading } = useAuthState(); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    // ✅ 2. Firebase 인증 자체가 로딩 중일 때는, 관리자 확인도 당연히 로딩 중입니다.
    if (authLoading) {
      setIsAdminLoading(true);
      return;
    }
    
    // ✅ 3. 인증 로딩이 끝났는데 사용자가 없으면, 관리자가 아니라고 확정합니다.
    if (!user) {
      setIsAdmin(false);
      setIsAdminLoading(false);
      return;
    }

    // ✅ 4. 인증이 완료된 사용자가 있을 때만 Cloud Function을 호출합니다.
    const checkAdminStatus = httpsCallable(functions, 'checkAdminStatus');

    checkAdminStatus()
      .then((result) => {
        // 서버 응답이 true일 때만 true로 설정합니다.
        setIsAdmin(result.data.isAdmin === true);
      })
      .catch((error) => {
        console.error("[useAdminCheck] 관리자 확인 함수 호출 실패:", error);
        setIsAdmin(false); // 에러 시 무조건 false
      })
      .finally(() => {
        setIsAdminLoading(false);
      });

  }, [user, authLoading]);

  return { isAdmin, isAdminLoading };
}