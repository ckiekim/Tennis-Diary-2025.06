import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, } from '@mui/material';

export default function AddGoodsDialog({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', shopper: '', price: 0, date: '', photo: '' });

  const handleChange = (e) => {
  const { name, value, type } = e.target;

  let newValue = value;

  if (type === 'number') {
    // 빈 문자열일 경우 NaN 방지
    newValue = value === '' ? '' : Number(value);
  }

  setForm((prev) => ({
    ...prev,
    [name]: newValue,
  }));
};

  const handleSave = () => {
    if (!form.name || !form.date) return;
    onAdd(form);
    onClose();
    setForm({ name: '', shopper: '', price: 0, date: '', photo: '' });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>용품 구매 추가</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField name="name" label="용품명" value={form.name} onChange={handleChange} fullWidth />
          <TextField name="shopper" label="구매처" value={form.shopper} onChange={handleChange} fullWidth />
          <TextField name="price" label="가격" value={form.price} onChange={handleChange} type="number" fullWidth />
          <TextField name="date" label="구매일" value={form.date} onChange={handleChange} type="date" fullWidth InputLabelProps={{ shrink: true }} />
          <TextField name="photo" label="사진 URL" value={form.photo} fullWidth margin="dense" onChange={handleChange} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
