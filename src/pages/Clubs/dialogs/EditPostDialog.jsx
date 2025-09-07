import { useState, useEffect } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, CircularProgress } from '@mui/material';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import AlertDialog from '../../../components/AlertDialog';

/**
 * 게시글 수정을 위한 다이얼로그 컴포넌트
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 표시 여부
 * @param {function} props.onClose - 다이얼로그 닫기 핸들러
 * @param {string} props.clubId - 클럽 ID
 * @param {object} props.post - 수정할 게시글 데이터 (id, title, content 포함)
 * @param {function} props.onSuccess - 수정 성공 시 호출될 콜백 함수
 */
const EditPostDialog = ({ open, onClose, clubId, post, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // post 데이터가 변경될 때마다(즉, 수정할 게시글이 선택될 때마다) title과 content 상태를 초기화
  useEffect(() => {
    if (post) {
      setTitle(post.title || '');
      setContent(post.content || '');
    }
  }, [post]);

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!post || title.trim() === '' || content.trim() === '') {
      setIsSuccess(false);
      setAlertMessage('제목과 내용을 모두 입력해주세요.');
      setIsAlertOpen(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. 업데이트할 문서의 참조를 가져옵니다.
      const postRef = doc(db, `clubs/${clubId}/posts`, post.id);
      
      // 2. 해당 문서를 새로운 데이터로 업데이트합니다.
      await updateDoc(postRef, {
        title, content, updatedAt: serverTimestamp(), // 수정 시각 업데이트
      });

      setIsSuccess(true);
      setAlertMessage('게시글이 성공적으로 수정되었습니다.');
      setIsAlertOpen(true);
    } catch (error) {
      console.error("게시글 수정 실패:", error);
      setIsSuccess(false);
      setAlertMessage("게시글 수정 중 오류가 발생했습니다.");
      setIsAlertOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    if (isSuccess) {
      if (onSuccess) {
        onSuccess(); // 부모 데이터 새로고침
      }
      handleClose(); // 수정 다이얼로그 닫기
    }
  };

  return (
    <>
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>게시글 수정</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus margin="dense" label="제목" type="text" fullWidth
            variant="standard" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isSubmitting}
          />
          <TextField
            margin="dense" label="내용" type="text" fullWidth multiline rows={10} sx={{ mt: 2 }}
            variant="outlined" value={content} onChange={(e) => setContent(e.target.value)} disabled={isSubmitting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>취소</Button>
          <Button onClick={handleSubmit} disabled={title.trim() === '' || content.trim() === '' || isSubmitting}>
            {isSubmitting ? <CircularProgress size={24} /> : '수정'}
          </Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={handleAlertClose}>
        {alertMessage}
      </AlertDialog>
    </>
  );
};

export default EditPostDialog;
