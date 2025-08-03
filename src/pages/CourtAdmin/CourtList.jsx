import React, { useState } from 'react';
import { Box, Fab, FormControl, Grid, InputLabel, MenuItem, Select, TextField, } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';
import useCourtList from '../../hooks/useCourtList';
import CourtCard from './CourtCard';
import AddCourtDialog from './dialogs/AddCourtDialog';
import EditCourtDialog from './dialogs/EditCourtDialog';
import DeleteConfirmDialog from './dialogs/DeleteConfirmDialog';

import AddIcon from '@mui/icons-material/Add';

const CourtList = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [region, setRegion] = useState('');
  const [isIndoor, setIsIndoor] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const courts = useCourtList(refreshKey);

  const handleRegionChange = (e) => setRegion(e.target.value);
  const handleIndoorChange = (e) => setIsIndoor(e.target.value);
  const filteredCourts = courts
    .filter(c => region === '' || c.location.includes(region))
    .filter(c => isIndoor === '' || String(c.is_indoor) === isIndoor);

  const handleAddCourt = async (form) => {
    await addDoc(collection(db, 'courts'), form);
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
    const ref = doc(db, 'courts', form.id);
    await updateDoc(ref, form);
    setRefreshKey((prev) => prev + 1);
  };

  const handleDeleteConfirm = async () => {
    await deletePhotoFromStorage(selectedCourt.photo);
    await deleteDoc(doc(db, 'courts', selectedCourt.id));
    setDeleteOpen(false);
    setRefreshKey((prev) => prev + 1);
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
        {filteredCourts.map((court) => (
          <CourtCard 
            key={court.id} court={court} 
            onEdit={() => handleEdit(court)} 
            onDelete={() => handleDelete(court)}
          />
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
        court={selectedCourt}
      />
    </>
  );
}

export default CourtList;
