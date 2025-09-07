import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Divider, Stack, Typography, Avatar } from '@mui/material';
import useSnapshotDocument from '../../hooks/useSnapshotDocument';
import MainLayout from '../../components/MainLayout';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage.js';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog.jsx';
import AlertDialog from '../../components/AlertDialog.jsx';

const UserDetailPage = () => {
  const { uid } = useParams();
  const navigate = useNavigate();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isDeleteSuccess, setIsDeleteSuccess] = useState(false);

  const { docData: user, loading } = useSnapshotDocument('users', uid);

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

  const handleDelete = async () => {
    try {
      if (user.photo) {
        await deletePhotoFromStorage(user.photo);
      }
      await deleteDoc(doc(db, 'users', uid));
      setDeleteOpen(false);
      setIsDeleteSuccess(true);
      setAlertMessage('사용자가 삭제되었습니다.');
      setIsAlertOpen(true);
    } catch (err) {
      console.error('삭제 실패:', err);
      setIsDeleteSuccess(false);
      setAlertMessage('삭제 중 문제가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  const handleAlertClose = () => {
    setIsAlertOpen(false);
    if (isDeleteSuccess) {
      navigate('/tools/users'); // 성공 알림창을 닫은 후 페이지 이동
    }
  };

  return (
    <MainLayout title='사용자 상세 정보'>
      <Box p={2}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar alt={user.nickname} src={user.photo || '/img/no-image.jpeg'} sx={{ width: 48, height: 48 }} />
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

        <Typography variant="body2" fontWeight="bold">마일리지</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4 }}>
          {user.mileage? user.mileage.toLocaleString() : '0'} 포인트
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">고유 ID (UID)</Typography>
        <Typography variant="body1" sx={{ mt: 1, ml: 4, wordBreak: 'break-all' }}>
          {uid}
        </Typography>
        <Divider sx={{ my: 1 }} />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        {/* <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button> */}
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
        <Button variant="contained" onClick={() => navigate(-1)}>목록으로</Button>
      </Stack>
      
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{user.nickname}" 사용자를 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>

      <AlertDialog open={isAlertOpen} onClose={handleAlertClose}>
        {alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default UserDetailPage;
