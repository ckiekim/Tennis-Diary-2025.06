import { Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Stack, TextField, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';

export default function EditGoodsDialog({ open, onClose, item, onSave }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [shopper, setShopper] = useState('');
  const [date, setDate] = useState('');
  const [photo, setPhoto] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (item) {
      setName(item.name || '');
      setPrice(item.price || '');
      setShopper(item.shopper || '');
      setDate(item.date || '');
      setPhoto(item.photo || '');
    }
  }, [item]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await uploadImageToFirebase(file, 'goods');
      await deletePhotoFromStorage(photo);
      setPhoto(photoUrl);
    } catch (error) {
      console.error('파일 업로드 실패:', error);
    } finally {
      setUploading(false);
    }
  };
  
  const handleSave = async () => {
    onSave({ ...item, name, price: Number(price), shopper, date, photo });
    onClose();
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

          {/* 이미지 업로드 */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
            {uploading ? (
              <>
                <CircularProgress size={24} />
                <Typography variant="body2" sx={{ ml: 1 }}>업로드 중...</Typography>
              </>
            ) : (
              <Button component="label" variant="outlined" disabled={uploading}>
                사진 선택
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            )}
          </Box>

          {/* 이미지 미리보기 */}
          {photo && (
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <img src={photo} alt="미리보기" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
