import { Button, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { uploadImageToFirebase } from '../../../api/fileUpload';

export default function EditGoodsDialog({ open, onClose, item, onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [shopper, setShopper] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price || '');
      setShopper(item.shopper || '');
      setDate(item.date || '');
      setPhoto(item.photo || '');
    }
  }, [item]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };
  
  const handleSave = async () => {
    let uploadedPhotoUrl = photo;
    if (file) {
      uploadedPhotoUrl = await uploadImageToFirebase(file, 'goods');
    }
    onSave({ ...item, name, price: Number(price), shopper, date, photo: uploadedPhotoUrl });
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
          {/* <TextField label="사진 URL" value={photo} onChange={(e) => setPhoto(e.target.value)} fullWidth /> */}
          <div>
            <Typography variant="body2" mb={1}>사진 업로드</Typography>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            {photo && !file && (
              <img src={photo} alt="기존 사진" style={{ width: 80, marginTop: 8 }} />
            )}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
