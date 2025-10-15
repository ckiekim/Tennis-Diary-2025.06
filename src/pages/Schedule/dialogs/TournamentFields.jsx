import React from 'react';
import { Grid, MenuItem, Stack, TextField } from '@mui/material';
import CourtSelection from './CourtSelection';
import { handleNumericInputChange } from '../../../utils/handleInput';
import { 
  tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions, ktaDivisions, dxoDivisions, wemixDivisions
} from '../../../constants/global';

export default function TournamentFields({ form, setForm, courts, courtProps }) {
  const handleOrganizerChange = (e) => {
    setForm({ ...form, organizer: e.target.value, division: '' });
  };

  return (
    <Stack spacing={2}>
      <TextField label="대회명" fullWidth size="small" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <TextField 
        label="날짜" type="date" fullWidth size="small" value={form.date || ''} 
        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
        InputLabelProps={{ shrink: true }} 
      />
      <CourtSelection courts={courts} {...courtProps} />
      <Grid container spacing={2}>
        <Grid item xs={6} sx={{ minWidth: 100 }}>
          <TextField label="참가종목" select fullWidth size="small" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={6} sx={{ maxWidth: 120 }}>
          <TextField label="파트너" fullWidth size="small" value={form.partner || ''} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
        </Grid>
      </Grid>
      <Grid container spacing={2}>
        <Grid item xs={6} sx={{ minWidth: 100 }}>
          <TextField label="주관" select fullWidth size="small" value={form.organizer || ''} onChange={handleOrganizerChange}>
            {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
          </TextField>
        </Grid>
        {form.organizer && (
          <Grid item xs={6} sx={{ minWidth: 120 }}>
            <TextField label="참가부문" select fullWidth size="small" value={form.division || ''} onChange={(e) => setForm({ ...form, division: e.target.value })}>
              {(
                form.organizer === 'KATA' ? kataDivisions :
                form.organizer === 'KATO' ? katoDivisions :
                form.organizer === 'KTA' ? ktaDivisions :
                form.organizer === '던롭' ? dxoDivisions :
                form.organizer === 'WEMIX' ? wemixDivisions :
                [] // 해당하는 주관사가 없을 경우 빈 배열 반환
              ).map(div => <MenuItem key={div} value={div}>{div}</MenuItem>)}
            </TextField>
          </Grid>
        )}
      </Grid>
      <TextField label="참가비" fullWidth size="small" type="number" value={form.price || ''}
        onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
      />
    </Stack>
  );
}