import React, { useState, useRef, useEffect, useCallback } from 'react';
// import useGoodsList from '../../hooks/useGoodsList';
import usePaginatedGoods from '../../hooks/usePaginatedGoods';
import useAuthState from '../../hooks/useAuthState';
import { Box, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';
import GoodsCard from './GoodsCard';
import AddGoodsDialog from './dialogs/AddGoodsDialog';
import EditGoodsDialog from './dialogs/EditGoodsDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';

const GoodsList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuthState();
  // const { goods, loading } = useGoodsList(refreshKey);
  const { goods, loading, hasMore, fetchMore } = usePaginatedGoods(user?.uid, refreshKey);

  // Intersection Observer를 위한 ref 생성
  const observerRef = useRef();

  // useCallback으로 fetchMore 함수를 감싸서 종속성 배열에 사용
  const handleFetchMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchMore();
  }, [loading, hasMore, fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // entry가 화면에 보이고, 로딩 중이 아니며, 더 불러올 데이터가 있을 때 fetchMore 호출
        if (entries[0].isIntersecting) {
          handleFetchMore();
        }
      },
      { threshold: 1.0 } // 대상 요소가 100% 보일 때 콜백 실행
    );

    const currentElement = observerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    // 컴포넌트 언마운트 시 observer 연결 해제
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [handleFetchMore]);

  const handleAddGoods = async (form) => {
    await addDoc(collection(db, 'goods'), form);
    setRefreshKey(prev => prev + 1);    // 데이터 다시 불러오도록
  };

  const handleUpdateGoods = async (form) => {
    const { id, ...rest } = form;
    await updateDoc(doc(db, 'goods', id), rest);
    setEditOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  const handleDeleteGoods = async () => {
    await deletePhotoFromStorage(selectedItem.photo);
    await deleteDoc(doc(db, 'goods', selectedItem.id));
    setDeleteOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  if (loading && goods.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {goods.length === 0 && !loading ? (
        <Box textAlign="center" mt={4}>
          <Typography variant="body1" color="text.secondary">
            등록된 용품이 없습니다.
          </Typography>
        </Box>
      ) : (
        <Stack spacing={1}>
          {goods.map(item => 
            <GoodsCard 
              key={item.id} item={item}
              onEdit={(item) => { setSelectedItem(item); setEditOpen(true); }}
              onDelete={(item) => { setSelectedItem(item); setDeleteOpen(true); }} 
            />
          )}
        </Stack>
      )}

      {/* 무한 스크롤 트리거 및 하단 로딩 인디케이터 */}
      <Box 
        ref={observerRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
      >
        { (loading && hasMore) && <CircularProgress size={30} /> }
        {!hasMore && goods.length > 0 && (
          <Typography variant="body2" color="text.secondary">마지막 용품입니다.</Typography>
        )}
      </Box>

      <Fab
        color="default"
        sx={{
          position: 'fixed', bottom: 80, right: 24, backgroundColor: 'black', color: 'white', zIndex: 20,
          '&:hover': { backgroundColor: '#333', },
        }}
        onClick={() => setAddOpen(true)}
      >
        <AddIcon /> 
      </Fab>

      <AddGoodsDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddGoods} uid={user?.uid} />
      <EditGoodsDialog open={editOpen} onClose={() => setEditOpen(false)} item={selectedItem} onSave={handleUpdateGoods} uid={user?.uid} />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteGoods}>
        "{selectedItem?.name}" 품목을 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>
    </>
  );
};

export default GoodsList;
