import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, } from '@mui/material';
import { useState, useEffect } from 'react';

export default function EditGoodsDialog({ open, onClose, item, onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [shopper, setShopper] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState('');

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price || '');
      setShopper(item.shopper || '');
      setDate(item.date || '');
      setPhoto(item.photo || '');
    }
  }, [item]);

  const handleSave = () => {
    onSave({ ...item, name, price: Number(price), shopper, date, photo, });
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>용품 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="용품명" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
          <TextField label="가격" type="number" value={price}
            onChange={(e) => setPrice(e.target.value)} fullWidth />
          <TextField label="구매처" value={shopper} onChange={(e) => setShopper(e.target.value)} fullWidth />
          <TextField label="구매일" type="date" value={date}
            onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
          <TextField label="사진 URL" value={photo} onChange={(e) => setPhoto(e.target.value)} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
