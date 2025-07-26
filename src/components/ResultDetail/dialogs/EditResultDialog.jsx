import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography } from '@mui/material';
import useCourtList from '../../../hooks/useCourtList';
import formatDay from '../../../utils/formatDay';

export default function EditResultDialog({open, onClose, result}) {
  const [form, setForm] = useState(result);
  const courts = useCourtList();
  const handleUpdate = () => {
    console.log(form);
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>게임 상세 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            일시: {`${result.date} (${formatDay(result.date)}) ${result.time}`}
          </Typography>
          <TextField
            label="장소" select fullWidth value={form?.place || ''} size='small'
            onChange={(e) => setForm({ ...form, place: e.target.value })}>
            {courts.map((court) => (
              <MenuItem key={court.id} value={court.name}>
                {court.name} ({court.surface})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="결과" fullWidth value={form?.result || ''} size='small'
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />
          <TextField
            label="소스" fullWidth value={form?.source || ''} size='small'
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <TextField
            label="비용" fullWidth type="number" value={form.price || ''} size='small'
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <TextField
            label="메모" fullWidth value={form?.memo || ''} size='small'
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button variant="contained" onClick={handleUpdate}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}