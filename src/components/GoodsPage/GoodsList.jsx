import React, { useState } from 'react';
import useGoodsList from '../../hooks/useGoodsList';
import { CircularProgress, Fab, Stack } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import GoodsCard from './GoodsCard';
import AddGoodsDialog from './dialogs/AddGoodsDialog';
import AddIcon from '@mui/icons-material/Add';

const GoodsList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { goods, loading } = useGoodsList(refreshKey);

  const handleAddGoods = async (form) => {
    // Firestore 저장 예시
    await addDoc(collection(db, 'goods'), form);
    setRefreshKey(prev => prev + 1); // 데이터 다시 불러오도록
  };


  if (loading) {
    return <CircularProgress />;
  }

  return (
    <>
      {/* <Box
        sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'white', paddingY: 1, textAlign: 'center',
              borderBottom: '1px solid #eee', }}
      >
        <Typography variant="h5">🎾 테니스 용품 구매</Typography>
      </Box> */}

      <Stack spacing={1}>
        {goods.map(item => 
          <GoodsCard key={item.id} item={item} />
        )}
      </Stack>

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

      <AddGoodsDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={handleAddGoods}
      />
    </>
  );
};

export default GoodsList;
