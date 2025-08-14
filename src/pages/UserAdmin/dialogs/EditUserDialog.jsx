import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';

const EditUserDialog = ({ open, onClose, user }) => {
  const [formData, setFormData] = useState({ nickname: '', location: '' });

  useEffect(() => {
    // 다이얼로그가 열릴 때 전달받은 user 데이터로 폼 상태를 초기화합니다.
    if (user) {
      setFormData({
        nickname: user.nickname || '',
        location: user.location || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        nickname: formData.nickname,
        location: formData.location,
      });
      alert('사용자 정보가 성공적으로 수정되었습니다.');
      onClose(); // 부모 컴포넌트의 onClose 함수를 호출하여 다이얼로그를 닫고 새로고침
    } catch (err) {
      console.error('수정 실패:', err);
      alert('정보 수정 중 문제가 발생했습니다.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>사용자 정보 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            name="nickname"
            label="닉네임"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.nickname}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="location"
            label="지역"
            type="text"
            fullWidth
            variant="outlined"
            value={formData.location}
            onChange={handleChange}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditUserDialog;
