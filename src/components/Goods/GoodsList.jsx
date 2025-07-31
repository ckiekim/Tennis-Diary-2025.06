import React, { useState } from 'react';
import useGoodsList from '../../hooks/useGoodsList';
import useAuthState from '../../hooks/useAuthState';
import { Box, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';
import GoodsCard from './GoodsCard';
import AddGoodsDialog from './dialogs/AddGoodsDialog';
import EditGoodsDialog from './dialogs/EditGoodsDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';

const GoodsList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const { goods, loading } = useGoodsList(refreshKey);
  const { user } = useAuthState();
  // console.log(user?.uid);

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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {goods.length === 0 ? (
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

      <AddGoodsDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={handleAddGoods} uid={user.uid} />
      <EditGoodsDialog open={editOpen} onClose={() => setEditOpen(false)} item={selectedItem} onSave={handleUpdateGoods} uid={user.uid} />
      <DeleteConfirmDialog open={deleteOpen} onClose={() => setDeleteOpen(false)} onConfirm={handleDeleteGoods} />
    </>
  );
};

export default GoodsList;
