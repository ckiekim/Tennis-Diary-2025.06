import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Divider, Stack, Typography, Avatar } from '@mui/material';
import useUserDoc from '../../hooks/useUserDoc';
import MainLayout from '../../components/MainLayout';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage.js';
import EditUserDialog from './dialogs/EditUserDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.jsx';

const UserDetailPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { docData: user, loading } = useUserDoc(uid, refreshKey);

  if (loading) return (
    <MainLayout title="로딩 중...">
      <Typography sx={{p: 2}}>로딩 중...</Typography>
    </MainLayout>
  );
  if (!user) return (
    <MainLayout title="오류">
      <Typography sx={{p: 2}}>사용자 정보가 없습니다.</Typography>
    </MainLayout>
  );

  const handleEditClose = () => {
    setEditOpen(false);
    setRefreshKey((prev) => prev + 1); // 수정 후 데이터 새로고침
  };

  const handleDelete = async () => {
    try {
      if (user.photo) {
        await deletePhotoFromStorage(user.photo);
      }
      await deleteDoc(doc(db, 'users', uid));
      setDeleteOpen(false);
      alert('사용자가 삭제되었습니다.');
      navigate('/admin/users'); // 사용자 목록 페이지로 이동
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <MainLayout title='사용자 상세 정보'>
      <Box p={2}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar alt={user.nickname} src={user.photo} sx={{ width: 48, height: 48 }} />
          <Typography variant="h6">{user.nickname}</Typography>
        </Stack>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" fontWeight="bold">이메일</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4 }}>
          {user.email}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">가입일</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4 }}>
          {user.joinDate}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">지역</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4 }}>
          {user.location}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">고유 ID (UID)</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4, wordBreak: 'break-all' }}>
          {user.uid}
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
        <Button variant="contained" onClick={() => navigate(-1)}>목록으로</Button>
      </Stack>
      
      <EditUserDialog open={editOpen} onClose={handleEditClose} user={user} />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{user.nickname}" 사용자를 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>
    </MainLayout>
  );
};

export default UserDetailPage;
