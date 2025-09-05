import { useState, memo } from 'react';
import { Box, Typography, TextField, Button, Stack, Avatar, Divider, CircularProgress } from '@mui/material';
import { collection, doc, writeBatch } from 'firebase/firestore';
import dayjs from 'dayjs';

import { db } from '../../api/firebaseConfig';
import useAuthState from '../../hooks/useAuthState';
import useSnapshotSubcollection from '../../hooks/useSnapshotSubcollection';

const Comments = memo(({ clubId, postId, currentUserProfile }) => {
  const { user: auth } = useAuthState();
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const commentsPath = `clubs/${clubId}/posts/${postId}/comments`;
  const { documents: comments, loading: commentsLoading } = useSnapshotSubcollection(
    commentsPath,
    { orderByField: 'createdAt', direction: 'asc' } // 오래된 순으로 정렬
  );

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!auth || !currentUserProfile || newComment.trim() === '') {
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(db);

    try {
      // 1. 새로운 댓글 문서 생성
      const commentRef = doc(collection(db, commentsPath)); // 자동 ID 생성
      batch.set(commentRef, {
        content: newComment, authorId: auth.uid,
        authorName: currentUserProfile.nickname, authorPhotoUrl: currentUserProfile.photo,
        createdAt: new Date(), // serverTimestamp는 batch에서 직접 사용 불가
      });

      // 2. 게시물 문서의 commentCount 1 증가
      const postRef = doc(db, 'clubs', clubId, 'posts', postId);
      batch.update(postRef, { commentCount: comments.length + 1 }); // increment(1) 대신 정확한 카운트로 보정

      await batch.commit();
      setNewComment(''); // 입력창 초기화
    } catch (error) {
      console.error("댓글 작성 실패:", error);
      alert("댓글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="body1" fontWeight="bold" gutterBottom>
        댓글 {comments.length}개
      </Typography>
      
      {/* 댓글 목록 */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {commentsLoading && <CircularProgress sx={{ mx: 'auto' }} />}
        {comments.map((comment, index) => (
          <Box key={comment.id}>
            <Stack direction="row" spacing={2}>
              <Avatar src={comment.authorPhotoUrl || ''} alt={comment.authorName} sx={{ width: 32, height: 32 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">
                  {comment.authorName}
                  <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    {dayjs(comment.createdAt?.toDate()).format('YY-MM-DD HH:mm')}
                  </Typography>
                </Typography>
                <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{comment.content}</Typography>
              </Box>
            </Stack>
            {index < comments.length - 1 && <Divider sx={{ mt: 2 }} />}
          </Box>
        ))}
      </Stack>

      {/* 댓글 작성 폼 */}
      {auth && (
        <Box component="form" onSubmit={handleAddComment}>
          <TextField
            fullWidth multiline rows={3} variant="outlined" placeholder="댓글을 남겨주세요."
            value={newComment} onChange={(e) => setNewComment(e.target.value)} disabled={isSubmitting}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit" variant="contained" sx={{ mt: 1 }}
              disabled={newComment.trim() === '' || isSubmitting}
            >
              {isSubmitting ? '등록 중...' : '댓글 등록'}
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
});

export default Comments;
