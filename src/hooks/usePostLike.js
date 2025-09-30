import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, writeBatch, increment } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import useAuthState from './useAuthState';

/**
 * 게시물 좋아요 기능을 관리하는 커스텀 훅.
 * @param {string} clubId - 클럽 ID
 * @param {string} postId - 게시물 ID
 */
const usePostLike = (clubId, postId, authorId) => {
  const { user } = useAuthState();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // 현재 유저가 이 게시물에 좋아요를 눌렀는지 확인하는 함수
  const checkIfLiked = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const likeRef = doc(db, 'clubs', clubId, 'posts', postId, 'likes', user.uid);
      const docSnap = await getDoc(likeRef);
      setIsLiked(docSnap.exists());
    } catch (error) {
      console.error("좋아요 상태 확인 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [clubId, postId, user]);

  useEffect(() => {
    checkIfLiked();
  }, [checkIfLiked]);


  // 좋아요 상태를 토글하는 함수 (좋아요/좋아요 취소)
  const toggleLike = async () => {
    if (!user || loading || user.uid === authorId) {
      return; // 로그인 상태가 아니거나, 로딩 중이거나, 본인 글이면 실행 방지
    }

    const batch = writeBatch(db);
    const postRef = doc(db, 'clubs', clubId, 'posts', postId);
    const likeRef = doc(db, 'clubs', clubId, 'posts', postId, 'likes', user.uid);

    try {
      if (isLiked) {
        // 좋아요 취소
        batch.delete(likeRef);
        batch.update(postRef, { likeCount: increment(-1) });
        setIsLiked(false);
      } else {
        // 좋아요
        batch.set(likeRef, { likedAt: new Date() }); // serverTimestamp는 batch에서 직접 사용 불가
        batch.update(postRef, { likeCount: increment(1) });
        setIsLiked(true);
      }
      await batch.commit();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      // 실패 시 UI 상태 원복
      setIsLiked(!isLiked); 
    }
  };

  return { isLiked, loading, toggleLike };
};

export default usePostLike;
