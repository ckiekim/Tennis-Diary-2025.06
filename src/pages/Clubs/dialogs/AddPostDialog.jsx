import { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress } from '@mui/material';
import { doc, collection, writeBatch, serverTimestamp } from 'firebase/firestore';

import { db } from '../../../api/firebaseConfig';
import useAuthState from '../../../hooks/useAuthState';
import AlertDialog from '../../../components/AlertDialog';

const AddPostDialog = ({ open, onClose, clubId, onSuccess, currentUserProfile }) => {
  const { user: auth } = useAuthState();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleClose = () => {
    if (isSubmitting) return;
    setTitle('');
    setContent('');
    setIsSuccess(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth || !currentUserProfile) {
        setAlertMessage('사용자 정보를 불러올 수 없습니다.');
        setIsAlertOpen(true);
        return;
    }
    if (title.trim() === '' || content.trim() === '') {
      setIsSuccess(false);
      setAlertMessage('제목과 내용을 모두 입력해주세요.');
      setIsAlertOpen(true);
      return;
    }

    setIsSubmitting(true);
    const batch = writeBatch(db);

    try {
      const postRef = doc(collection(db, `clubs/${clubId}/posts`));
      batch.set(postRef, {
        title, content, authorId: auth.uid, 
        authorName: currentUserProfile.nickname, authorPhotoUrl: currentUserProfile.photo,
        createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
        viewCount: 0, likeCount: 0, commentCount: 0, isPinned: false,
        category: '자유글',
      });
      
      await batch.commit();
      
      setIsSuccess(true);
      setAlertMessage('게시글이 성공적으로 등록되었습니다.');
      setIsAlertOpen(true);
      
    } catch (error) {
      console.error("게시글 작성 실패:", error);
      setIsSuccess(false);
      setAlertMessage('게시글 작성 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    if (isSuccess) {
      if (onSuccess) {
        onSuccess(); 
      }
      handleClose(); 
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>새 게시글 작성</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="제목" type="text" fullWidth
            variant="standard" value={title}
            onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting}
          />
          <TextField
            margin="dense" label="내용" type="text" fullWidth multiline rows={10}
            variant="outlined" value={content} sx={{ mt: 2 }}
            onChange={(e) => setContent(e.target.value)} disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>취소</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : '등록'}
          </Button>
        </DialogActions>
      </Dialog>
      <AlertDialog open={isAlertOpen} onClose={handleAlertClose}>
        {alertMessage}
      </AlertDialog>
    </>
  );
};

export default AddPostDialog;