import { useMemo } from 'react';
import useAuthState from './useAuthState';
import { getFunctions, httpsCallable } from 'firebase/functions';

export default function useAdminCheck() {
  const { user, loading: isAuthLoading } = useAuthState();

  // '관리자 여부'와 '관리자 확인 중'이라는 별도의 상태를 관리
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);

  useEffect(() => {
    // 로그인한 사용자(user)가 있을 때만 Cloud Function을 호출
    if (user) {
      setIsAdminLoading(true); // 관리자 확인 시작
      const functions = getFunctions();
      const checkAdminStatus = httpsCallable(functions, 'checkAdminStatus');

      checkAdminStatus()
        .then((result) => {
          // Cloud Function의 응답 결과로 isAdmin 상태를 업데이트
          setIsAdmin(result.data.isAdmin);
        })
        .catch((error) => {
          console.error("관리자 상태 확인에 실패했습니다:", error);
          setIsAdmin(false); // 에러 발생 시 false로 처리
        })
        .finally(() => {
          setIsAdminLoading(false); // 확인 완료 (성공/실패 무관)
        });
    } else {
      // 사용자가 로그아웃 상태이면 관리자가 아니며, 확인도 끝난 상태
      setIsAdmin(false);
      setIsAdminLoading(false);
    }
  }, [user]); // user 객체가 변경될 때마다 이 로직을 다시 실행합니다.

  // 컴포넌트에서 사용할 상태들을 반환
  return { isAdmin, isAdminLoading, isAuthLoading };
}