import React, { useState } from 'react';
import { Box, Card, CardMedia, Fab, Grid, IconButton, TextField, Typography, } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import useCourtList from '../../hooks/useCourtList';

const CourtList = () => {
  const courts = useCourtList();
  const [open, setOpen] = useState(false);
  const [region, setRegion] = useState('');

  const handleRegionChange = (e) => setRegion(e.target.value);

  const filteredCourts = courts
    .filter(c => region === '' || c.location.includes(region))
    .sort((a, b) => a.name.localeCompare(b.name));

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
                {court.name}
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
              <IconButton size="small">
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton size="small">
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
        onClick={() => setOpen(true)}
      >
        <AddIcon /> 
      </Fab>
    </>
  );
}

export default CourtList;
