import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, ImageList, ImageListItem, Stack, Typography } from '@mui/material';
import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import useSubcollection from '../../hooks/useSubcollection';
import formatDay from '../../utils/formatDay';
import MainLayout from '../../components/MainLayout';
import EditGameDialog from './dialogs/EditGameDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import AlertDialog from '../../components/AlertDialog';
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
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // const { docData: result, loading } = useDocument('events', id, refreshKey);
  const { docData: eventData, loading: eventLoading } = useDocument('events', id, refreshKey);
  const { user } = useAuthState();

  const resultsPath = id ? `events/${id}/event_results` : null;
  const { documents: eventResults, loading: resultLoading } = useSubcollection(
    resultsPath, 
    { orderByField: 'createdAt', orderByDirection: 'desc' }, // 최신 결과를 가져오기 위해 정렬
    refreshKey
  );
  const resultData = eventResults?.[0];

  const loading = eventLoading || resultLoading;
  const combinedData = eventData && resultData ? { ...eventData, ...resultData } : eventData;

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
    if (!combinedData || !user?.uid) {
      setAlertMessage('사용자 정보가 올바르지 않습니다.');
      setIsAlertOpen(true);
      return;
    }
    try {
      const photoList = resultData?.photoList || [];
      for (const url of photoList) {
        await deletePhotoFromStorage(url);
      }
      
      // 3. resultData의 id를 사용하여 서브컬렉션 문서 삭제
      if (resultData?.id) {
        await deleteDoc(doc(db, 'events', id, 'event_results', resultData.id));
      }
      
      // events 문서 삭제
      await deleteDoc(doc(db, 'events', id));
      
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-10) });
      setDeleteOpen(false);
      navigate(-1);
    } catch (err) {
      console.error('삭제 실패:', err);
      setAlertMessage('삭제 중 문제가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (!combinedData) return <Typography>데이터가 없습니다.</Typography>;

  return (
    <MainLayout title='게임 상세'>
      <Box p={2}>
        {combinedData.club && (
          <>
            <Typography variant="body2" fontWeight="bold">정모</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {combinedData.club}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Typography variant="body2" fontWeight="bold">일시</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {`${combinedData.date} (${formatDay(combinedData.date)}) ${combinedData.time}`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">장소</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {combinedData.place} 테니스코트
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">결과</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {combinedData.result}
        </Typography>
        <Divider sx={{ my: 1 }} />

        {combinedData.source && (
          <>
            <Typography variant="body2" fontWeight="bold">소스</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {combinedData.source}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {combinedData.price && (
          <>
            <Typography variant="body2" fontWeight="bold">비용</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {combinedData.price.toLocaleString()}원
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Typography variant="body2" fontWeight="bold">메모</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {combinedData.memo || '메모 없음'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">사진</Typography>
        {combinedData.photoList?.length > 0 ? (
          <ImageList cols={3} gap={8} sx={{ mt: 1, ml: 4 }}>
            {combinedData.photoList.map((url, index) => (
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

      <EditGameDialog open={editOpen} onClose={handleEditClose} result={combinedData} uid={user.uid} />

      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{combinedData?.date} {combinedData?.time}" 일정 및 결과를 삭제하시겠습니까?
      </DeleteConfirmDialog>

      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default GameDetailPage;
