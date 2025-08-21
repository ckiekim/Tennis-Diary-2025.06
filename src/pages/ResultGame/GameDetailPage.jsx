import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, ImageList, ImageListItem, Stack, Typography } from '@mui/material';
import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import formatDay from '../../utils/formatDay';
import MainLayout from '../../components/MainLayout';
import EditResultDialog from './dialogs/EditGameDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';

const GameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { docData: result, loading } = useDocument('events', id, refreshKey);
  const { user } = useAuthState();

  if (loading) return <Typography>로딩 중...</Typography>;
  if (!result) return <Typography>데이터가 없습니다.</Typography>;

  const handleOpen = (url) => {
    setSelectedImage(url);
    setImageOpen(true);
  };

  const handleClose = () => {
    setImageOpen(false);
    setSelectedImage('');
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDelete = async () => {
    if (!result || !user?.uid) {
      alert('사용자 정보가 올바르지 않습니다.');
      return;
    }
    try {
      const photoList = result.photoList || [];
      for (const url of photoList) {
        await deletePhotoFromStorage(url);
      }
      await deleteDoc(doc(db, 'events', id));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-10) });
      setDeleteOpen(false);
      navigate(-1);
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 문제가 발생했습니다.');
    }
  };

  if (!result) return <Typography>로딩 중...</Typography>;

  return (
    <MainLayout title='게임 상세'>
      <Box p={2}>
        <Typography variant="body2" fontWeight="bold">일시</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {`${result.date} (${formatDay(result.date)}) ${result.time}`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">장소</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.place} 테니스코트
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">결과</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.result}
        </Typography>
        <Divider sx={{ my: 1 }} />

        {result.source && (
          <>
            <Typography variant="body2" fontWeight="bold">소스</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {result.source}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {result.price && (
          <>
            <Typography variant="body2" fontWeight="bold">비용</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {result.price.toLocaleString()}원
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Typography variant="body2" fontWeight="bold">메모</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.memo || '메모 없음'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">사진</Typography>
        {result.photoList?.length > 0 ? (
          <ImageList cols={3} gap={8} sx={{ mt: 1, ml: 4 }}>
            {result.photoList.map((url, index) => (
              <ImageListItem key={index} onClick={() => handleOpen(url)} sx={{ cursor: 'pointer' }}>
                <img src={url} alt={`photo-${index}`} loading="lazy" />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>사진 없음</Typography>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
        <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
        <Button variant="contained" onClick={() => navigate(-1)}>뒤로</Button>
      </Stack>

      {/* 확대 이미지 다이얼로그 */}
      <Dialog open={imageOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={selectedImage} alt="확대 이미지" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <EditResultDialog open={editOpen} onClose={handleEditClose} result={result} uid={user.uid} />

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{result?.date} {result?.time}" 일정 및 결과를 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>
    </MainLayout>
  );
};

export default GameDetailPage;
