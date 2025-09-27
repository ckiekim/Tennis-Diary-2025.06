import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, ImageList, ImageListItem, Stack, Typography } from '@mui/material';
import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import useCourtList from '../../hooks/useCourtList';
import useSubcollection from '../../hooks/useSubcollection';
import formatDay from '../../utils/formatDay';
import MainLayout from '../../components/MainLayout';
import EditTournamentDialog from './dialogs/EditTournamentDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import AlertDialog from '../../components/AlertDialog';
import { deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';

const TournamentDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { docData: eventData, loading: eventLoading } = useDocument('events', id, refreshKey);
  const { user } = useAuthState();
  const courts = useCourtList();

  const resultsPath = id ? `events/${id}/event_results` : null;
  const { documents: eventResults, loading: resultLoading } = useSubcollection(
    resultsPath, { orderByField: 'createdAt', orderByDirection: 'desc' }, refreshKey
  );
  const resultData = eventResults?.[0];
  const loading = eventLoading || resultLoading;
  const combinedData = eventData && resultData ? { ...eventData, ...resultData, id: eventData.id } : eventData;

  const handleOpenImage = (url) => {
    setSelectedImage(url);
    setImageOpen(true);
  };

  const handleCloseImage = () => {
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
      // 사진 삭제 (resultData에 photoList가 있음)
      const photoList = resultData?.photoList || [];
      for (const url of photoList) {
        await deletePhotoFromStorage(url);
      }
      // event_results 문서 삭제
      if (resultData?.id) {
        await deleteDoc(doc(db, 'events', id, 'event_results', resultData.id));
      }
      // events 문서 삭제
      await deleteDoc(doc(db, 'events', id));
      // 마일리지 차감
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-10) });
      setDeleteOpen(false);
      navigate('/result/tournament');
    } catch (err) {
      console.error('삭제 실패:', err);
      setAlertMessage('삭제 중 문제가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  if (loading) return <Typography>로딩 중...</Typography>;
  if (!combinedData) return <Typography>데이터가 없습니다.</Typography>;

  const displayPlace = combinedData.placeInfo.courtType === '실내'
    ? `${combinedData.placeInfo.courtName} (실내)` : combinedData.placeInfo.courtName;

  return (
    <MainLayout title='대회 상세'>
      <Box p={2}>
        <Typography variant="body2" fontWeight="bold">대회명</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {combinedData.name}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" fontWeight="bold">일자</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {`${combinedData.date} (${formatDay(combinedData.date)})`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">장소</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {displayPlace} 테니스코트
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">참가 정보</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {`종목: ${combinedData.category}`}
          {combinedData.partner && ` / 파트너: ${combinedData.partner}`}
          {combinedData.organizer && ` / 주관: ${combinedData.organizer}(${combinedData.division})`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">결과</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {combinedData.result || '결과 미입력'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        {combinedData.price && (
          <>
            <Typography variant="body2" fontWeight="bold">참가비</Typography>
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
              <ImageListItem key={index} onClick={() => handleOpenImage(url)} sx={{ cursor: 'pointer' }}>
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
      
      {/* --- Dialogs --- */}
      <Dialog open={imageOpen} onClose={handleCloseImage} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={selectedImage} alt="확대 이미지" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>
      
      {editOpen && <EditTournamentDialog 
        open={editOpen} onClose={handleEditClose} result={combinedData} uid={user.uid} resultData={resultData}
        courts={courts}
      />}

      <ConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{combinedData?.date}, {combinedData?.name}" 대회 결과를 삭제하시겠습니까? 
      </ConfirmDialog>

      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default TournamentDetailPage;