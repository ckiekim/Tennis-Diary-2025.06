import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField, } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';
import usePaginatedCourts from '../../hooks/usePaginatedCourts';
import CourtCard from './CourtCard';
import AddCourtDialog from './dialogs/AddCourtDialog';
import EditCourtDialog from './dialogs/EditCourtDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';

import AddIcon from '@mui/icons-material/Add';

const CourtList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [region, setRegion] = useState('');
  const [isIndoor, setIsIndoor] = useState('');
  
  const filters = useMemo(() => ({ region, isIndoor }), [region, isIndoor]);
  const { courts, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedCourts(filters);

  // 1. Intersection Observer가 감시할 요소에 대한 ref 생성
  const observerRef = useRef(null);

  // 2. Intersection Observer 설정
  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading && !loadingMore) { 
      loadMore();
    }
  }, [loadMore, hasMore, loading, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0, // 요소가 1px이라도 보이면 콜백 실행
    });

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    // 컴포넌트가 언마운트될 때 observer 정리
    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [handleObserver]);

  const handleRegionChange = (e) => setRegion(e.target.value);
  const handleIndoorChange = (e) => setIsIndoor(e.target.value);

  const handleAddCourt = async (form) => {
    await addDoc(collection(db, 'courts'), form);
    refresh();
  };

  const handleEdit = (court) => {
    setSelectedCourt(court);
    setEditOpen(true);
  };

  const handleDelete = (court) => {
    setSelectedCourt(court);
    setDeleteOpen(true);
  };

  const handleUpdateCourt = async (form) => {
    const ref = doc(db, 'courts', form.id);
    await updateDoc(ref, form);
    refresh();
  };

  const handleDeleteConfirm = async () => {
    await deletePhotoFromStorage(selectedCourt.photo);
    await deleteDoc(doc(db, 'courts', selectedCourt.id));
    setDeleteOpen(false);
    refresh();
  };

  return (
    <>
      <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={8} sx={{maxWidth: 200}}>
          <TextField
            label="지역" value={region} onChange={handleRegionChange} size="small" fullWidth
          />
        </Grid>
        <Grid item xs={4}>
          <FormControl fullWidth size="small" sx={{ minWidth: 100 }}>
            <InputLabel>실내여부</InputLabel>
            <Select value={isIndoor} onChange={handleIndoorChange} label="실내여부">
              <MenuItem value="">전체</MenuItem>
              <MenuItem value="true">실내</MenuItem>
              <MenuItem value="false">실외</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <Box display="flex" flexDirection="column" gap={1}>
        {courts.map((court) => (
          <CourtCard 
            key={court.id} court={court} 
            onEdit={() => handleEdit(court)} 
            onDelete={() => handleDelete(court)}
          />
        ))}
      </Box>

      {/* 3. 감시할 요소를 리스트 마지막에 추가하고 ref를 연결 */}
      {/* 로딩 인디케이터와 마지막 메시지를 이 위치로 이동 */}
      <Box 
        ref={observerRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
      >
        { (loading || loadingMore) && <CircularProgress /> } {/* 로딩 상태를 둘 다 확인 */}
        {!hasMore && !(loading || loadingMore) && courts.length > 0 && (
          <p>마지막 코트입니다.</p>
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

      <AddCourtDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAddCourt}
      />

      <EditCourtDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        court={selectedCourt}
        onUpdate={handleUpdateCourt}
      />

      <DeleteConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteConfirm}
      >
        "{selectedCourt?.name}" 코트를 삭제하시겠습니까? <br />
        이 작업은 되돌릴 수 없습니다.
      </DeleteConfirmDialog>
    </>
  );
}

export default CourtList;
