import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField, } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';
import usePaginatedCourts from '../../hooks/usePaginatedCourts';
import CourtCard from './components/CourtCard';
import AddCourtDialog from './dialogs/AddCourtDialog';
import EditCourtDialog from './dialogs/EditCourtDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';
import MainLayout from '../../components/MainLayout';

export default function CourtAdminPage() {
	const [addOpen, setAddOpen] = useState(false);
	const [editOpen, setEditOpen] = useState(false);
	const [deleteOpen, setDeleteOpen] = useState(false);
	const [selectedCourt, setSelectedCourt] = useState(null);
  const [searchType, setSearchType] = useState('name'); // 'name' 또는 'location'
	const [searchTerm, setSearchTerm] = useState('');
	
	const filters = useMemo(() => ({ searchType, searchTerm }), [searchType, searchTerm]);
	const { courts, loading, loadingMore, hasMore, loadMore, refresh } = usePaginatedCourts(filters);
	const observerRef = useRef(null);

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
	  <MainLayout title='코트 관리'>
		  <Grid container spacing={1} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={4} sx={{minWidth: 120, maxWidth: 140}}>
          <FormControl fullWidth size="small">
            <InputLabel>검색 기준</InputLabel>
            <Select 
              value={searchType} 
              onChange={(e) => setSearchType(e.target.value)} 
              label="검색 기준"
            >
              <MenuItem value="name">코트 이름</MenuItem>
              <MenuItem value="location">지역</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={8} sx={{maxWidth: 140}}>
          <TextField
            label="검색어 입력"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            fullWidth
          />
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

      {/* 감시할 요소를 리스트 마지막에 추가하고 ref를 연결 */}
      {/* 로딩 인디케이터와 마지막 메시지를 이 위치로 이동 */}
      <Box 
        ref={observerRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
      >
        { (loading || loadingMore) && <CircularProgress /> } {/* 로딩 상태를 둘 다 확인 */}
        {!hasMore && !(loading || loadingMore) && courts.length > 0 && (
          <p>마지막 목록입니다.</p>
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
        "{selectedCourt?.name}" 코트를 삭제하시겠습니까? 
      </DeleteConfirmDialog>
	  </MainLayout>
	);
}