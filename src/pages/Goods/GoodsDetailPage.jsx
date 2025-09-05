import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, Stack, Typography } from '@mui/material';
import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import formatDay from '../../utils/formatDay';
import MainLayout from '../../components/MainLayout';
import EditGoodsDialog from './dialogs/EditGoodsDialog'; // 수정 다이얼로그
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { deleteDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';

const GoodsDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { docData: item, loading } = useDocument('goods', id, refreshKey);
  const { user } = useAuthState();

  if (loading) return <Typography>로딩 중...</Typography>;
  if (!item) return <Typography>데이터가 없습니다.</Typography>;

  const handleOpenImage = () => {
    if (item.photo) {
      setImageOpen(true);
    }
  };

  const handleCloseImage = () => {
    setImageOpen(false);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    // setRefreshKey((prev) => prev + 1);
  };

  const handleUpdate = async (updatedItem) => {
    if (!id) return;
    try {
      const { id: itemId, ...dataToUpdate } = updatedItem;
      const docRef = doc(db, 'goods', id);
      await updateDoc(docRef, dataToUpdate);
      setRefreshKey((prev) => prev + 1); // 데이터 새로고침
    } catch (error) {
      console.error("업데이트 실패:", error);
      alert("용품 정보 업데이트에 실패했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!item || !user?.uid) {
      alert('사용자 정보가 올바르지 않습니다.');
      return;
    }
    try {
      if (item.photo) {
        await deletePhotoFromStorage(item.photo);
      }
      await deleteDoc(doc(db, 'goods', id));
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, { mileage: increment(-10) }); // 용품 등록시 10점 가정
      setDeleteOpen(false);
      navigate('/tools/goods'); // 삭제 후 목록 페이지로 이동
    } catch (err) {
      console.error('삭제 실패:', err);
      alert('삭제 중 문제가 발생했습니다.');
    }
  };

  return (
    <MainLayout title='용품 상세'>
      <Box p={2}>
        <Typography variant="h6" fontWeight="bold" gutterBottom>{item.name}</Typography>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body2" fontWeight="bold">구매일</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {`${item.date} (${formatDay(item.date)})`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">구매처</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {item.shopper}
        </Typography>
        <Divider sx={{ my: 1 }} />
        
        <Typography variant="body2" fontWeight="bold">가격</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {item.price.toLocaleString()}원
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">메모</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {item.memo || '메모 없음'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">사진</Typography>
        {item.photo ? (
          <Box
            component="img" src={item.photo} alt={item.name}
            onClick={handleOpenImage}
            sx={{ 
              width: '50%', mt: 1, ml: 4, borderRadius: 2, cursor: 'pointer',
              maxWidth: '200px'
            }}
          />
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
      <Dialog open={imageOpen} onClose={handleCloseImage} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={item.photo} alt="확대 이미지" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 (EditGoodsDialog가 있다고 가정) */}
      {editOpen && <EditGoodsDialog open={editOpen} onClose={handleEditClose} item={item} onSave={handleUpdate} uid={user.uid} />}

      {/* 삭제 확인 다이얼로그 */}
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDelete}>
        "{item?.name}" 용품 정보를 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>
    </MainLayout>
  );
};

export default GoodsDetailPage;
