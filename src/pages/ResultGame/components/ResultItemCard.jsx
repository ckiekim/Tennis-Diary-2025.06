import { useState } from 'react';
import { Button, Card, Dialog, DialogContent, Divider, ImageList, ImageListItem, Stack, Typography } from '@mui/material';
import { doc, updateDoc, increment, deleteDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../../api/firebaseStorage';

import EditGameDialog from '../dialogs/EditGameDialog';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog';
import AlertDialog from '../../../components/AlertDialog';
import useDocument from '../../../hooks/useDocument';

// 개별 결과 카드를 표시하는 컴포넌트
export default function ResultItemCard({ eventId, eventData, resultData, currentUser, onUpdate, isPersonal }) {
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  // 결과 작성자의 닉네임을 가져오기 위함
  const { docData: author } = useDocument('users', resultData.uid);

  const isOwner = currentUser?.uid === resultData.uid;

  const handleEditClose = () => {
    setEditOpen(false);
    onUpdate(); // 부모 컴포넌트에 변경사항 알림 (리프레시)
  };

  const handleDelete = async () => {
    try {
      // 1. 스토리지에서 사진 삭제
      for (const url of resultData.photoList || []) {
        await deletePhotoFromStorage(url);
      }

      // 2. event_results 서브컬렉션에서 이 결과 문서만 삭제
      await deleteDoc(doc(db, 'events', eventId, 'event_results', resultData.id));

      // 3. 부모 event 문서의 participantUids 배열에서 현재 유저 uid 제거
      const eventRef = doc(db, 'events', eventId);
      await updateDoc(eventRef, {
        participantUids: arrayRemove(currentUser.uid)
      });
      
      // 4. 사용자 마일리지 차감
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { mileage: increment(-10) });

      setDeleteOpen(false);
      onUpdate(); // 부모 컴포넌트에 변경사항 알림 (리프레시)

    } catch (err) {
      console.error('삭제 실패:', err);
      setAlertMessage('삭제 중 문제가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  const handleOpenImage = (url) => {
    setSelectedImage(url);
    setImageOpen(true);
  };

  return (
    <Card sx={{ p: 2, mb: 2 }}>
      {!isPersonal && (
        <>
          <Typography variant="subtitle1" fontWeight="bold">
            작성자: {author?.nickname || '...'}
          </Typography>
          <Divider sx={{ my: 1 }} />
        </>
      )}

      <Typography variant="body2" fontWeight="bold">결과</Typography>
      <Typography variant="body2" sx={{ mt: 1, ml: 1 }}>{resultData.result}</Typography>
      <Divider sx={{ my: 1 }} />
      
      <Typography variant="body2" fontWeight="bold">메모</Typography>
      <Typography variant="body2" sx={{ mt: 1, ml: 1, whiteSpace: 'pre-line' }}>
        {resultData.memo || '메모 없음'}
      </Typography>
      <Divider sx={{ my: 1 }} />

      <Typography variant="body2" fontWeight="bold">사진</Typography>
      {resultData.photoList?.length > 0 ? (
        <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
          {resultData.photoList.map((url, index) => (
            <ImageListItem key={index} onClick={() => handleOpenImage(url)} sx={{ cursor: 'pointer' }}>
              <img src={url} alt={`photo-${index}`} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Typography variant="body2" sx={{ mt: 1, ml: 1 }}>사진 없음</Typography>
      )}

      {isOwner && (
        <Stack direction="row" spacing={1} justifyContent="flex-end" mt={2}>
          <Button size="small" variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
          <Button size="small" variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
        </Stack>
      )}

      {/* 다이얼로그들 */}
      <Dialog open={imageOpen} onClose={() => setImageOpen(false)}><DialogContent><img src={selectedImage} alt="enlarged" style={{ width: '100%' }} /></DialogContent></Dialog>
      {/* <EditGameDialog open={editOpen} onClose={handleEditClose} result={{...resultData, eventId}} /> */}
      <EditGameDialog
        open={editOpen}
        onClose={handleEditClose}
        eventData={eventData}
        resultData={resultData}
        uid={currentUser.uid}
      />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        이 결과를 삭제하시겠습니까?
      </DeleteConfirmDialog>
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>{alertMessage}</AlertDialog>
    </Card>
  );
}