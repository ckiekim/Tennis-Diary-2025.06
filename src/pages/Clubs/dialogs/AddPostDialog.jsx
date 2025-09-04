import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress } from '@mui/material';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

import { db } from '../../../api/firebaseConfig';
import useAuthState from '../../../hooks/useAuthState';

const AddPostDialog = ({ open, onClose, clubId, onSuccess, currentUserProfile }) => {
  const { user: auth } = useAuthState();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle('');
    setContent('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth || !currentUserProfile || title.trim() === '' || content.trim() === '') {
      alert('제목과 내용을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(db);

    try {
      // 1. 새로운 게시물 문서 생성
      const postRef = doc(collection(db, `clubs/${clubId}/posts`));
      batch.set(postRef, {
        title, content, authorId: auth.uid, 
        authorName: currentUserProfile.nickname, authorPhotoUrl: currentUserProfile.photo,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        viewCount: 0, likeCount: 0, commentCount: 0, isPinned: false,
        category: '자유글', // 기본 카테고리
      });
      
      // 필요하다면 다른 작업도 batch에 추가 가능 (예: 클럽의 latestPost 필드 업데이트 등)

      await batch.commit();
      alert('게시글이 성공적으로 등록되었습니다.');
      if (onSuccess) { // onSuccess 콜백이 있으면 호출
        onSuccess();
      }
      handleClose();
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      alert("게시글 작성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>새 게시글 작성</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="제목"
          type="text"
          fullWidth
          variant="standard"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
        />
        <TextField
          margin="dense"
          label="내용"
          type="text"
          fullWidth
          multiline
          rows={10}
          variant="outlined"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isSubmitting}
          sx={{ mt: 2 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isSubmitting}>취소</Button>
        <Button onClick={handleSubmit} disabled={title.trim() === '' || content.trim() === '' || isSubmitting}>
          {isSubmitting ? <CircularProgress size={24} /> : '등록'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddPostDialog;