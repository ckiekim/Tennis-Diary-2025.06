import { useEffect } from 'react';
import { doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import useAuthState from './useAuthState';

/**
 * 게시물 조회수를 증가시키는 커스텀 훅.
 * @param {string} clubId - 클럽 ID
 * @param {string} postId - 게시물 ID
 * @param {string} authorId - 게시물 작성자 ID
 */
const usePostViewCount = (clubId, postId, authorId) => {
  const { user } = useAuthState(); // 현재 로그인된 사용자 정보

  useEffect(() => {
    const incrementViewCount = async () => {
      // 1. 로그인 상태가 아니거나, 게시물 작성자와 현재 유저가 같으면 함수 종료
      if (!user || !authorId || user.uid === authorId) {
        return;
      }

      // 2. 세션 스토리지에서 이미 조회한 게시물 목록을 가져옴
      const viewedPosts = JSON.parse(sessionStorage.getItem('viewedPosts')) || [];

      // 3. 현재 게시물이 이미 조회 목록에 있으면 함수 종료 (중복 조회 방지)
      if (viewedPosts.includes(postId)) {
        return;
      }

      try {
        // 4. Firestore 문서의 viewCount 필드를 1 증가시킴 (atomic update)
        const postRef = doc(db, 'clubs', clubId, 'posts', postId);
        await updateDoc(postRef, {
          viewCount: increment(1)
        });

        // 5. 성공적으로 업데이트되면 세션 스토리지에 현재 게시물 ID를 추가
        sessionStorage.setItem('viewedPosts', JSON.stringify([...viewedPosts, postId]));
        
      } catch (error) {
        console.error("조회수 업데이트 실패:", error);
      }
    };

    // postId와 authorId가 유효할 때만 함수를 실행
    if (clubId && postId && authorId) {
      incrementViewCount();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clubId, postId, authorId, user]); // 의존성 배열에 필요한 값들을 추가
};

export default usePostViewCount;
