import React, { useEffect, useState } from 'react';
import { Box, Card, CardMedia, Fab, Grid, IconButton, TextField, Typography, } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import AddCourtDialog from './dialogs/AddCourtDialog';
import EditCourtDialog from './dialogs/EditCourtDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const CourtList = () => {
  const [courts, setCourts] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [region, setRegion] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRegionChange = (e) => setRegion(e.target.value);
  const filteredCourts = courts.filter(c => region === '' || c.location.includes(region));

  const fetchCourts = async () => {
    const snapshot = await getDocs(collection(db, 'court'));
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => a.name.localeCompare(b.name)); // 이름순 정렬
    setCourts(data);
  };

  useEffect(() => {
    fetchCourts();
  }, [refreshKey]);

  const handleSaveCourt = async (form) => {
    await addDoc(collection(db, 'court'), form);
    setRefreshKey(prev => prev + 1);
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
    const ref = doc(db, 'court', form.id);
    await updateDoc(ref, form);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteConfirm = async () => {
    await deleteDoc(doc(db, 'court', selectedCourt.id));
    setDeleteOpen(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <>
      <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
        🎾 테니스 코트 관리
      </Typography>

      <Grid container spacing={1} alignItems="center" sx={{ mb: 2, ml: 5, mr: 5 }}>
        <TextField
          label="지역" value={region} onChange={handleRegionChange} size="small" fullWidth
        />
      </Grid>

      <Box display="flex" flexDirection="column" gap={1}>
        {filteredCourts.map((court) => (
          <Card
            key={court.id}
            sx={{ display: 'flex', alignItems: 'flex-start', width: '100%', position: 'relative', px: 1, py: 1, }}
          >
            {court.photo && (
              <CardMedia
                component="img"
                sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1, }}
                image={court.photo}
                alt={court.name}
              />
            )}

            <Box sx={{ ml: 2, flexGrow: 1 }}>
              <Typography fontSize="13px" fontWeight="bold" noWrap>
                {court.name} 테니스코트
              </Typography>
              <Typography fontSize="12px" color="text.secondary">
                {court.location}
              </Typography>
              <Typography fontSize="12px" color="text.secondary">
                {court.surface}
                {court.is_indoor && ' / 실내'}
              </Typography>
            </Box>

            {/* 아이콘 영역 */}
            <Box sx={{ position: 'absolute', top: 4, right: 4 }}>
              <IconButton size="small" onClick={() => handleEdit(court)}>
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleDelete(court)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Card>
        ))}
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
        onSave={handleSaveCourt}
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
        court={selectedCourt}
      />
    </>
  );
}

export default CourtList;
