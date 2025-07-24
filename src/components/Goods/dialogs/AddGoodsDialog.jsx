import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { uploadImageToFirebase } from '../../../api/fileUpload';

export default function AddGoodsDialog({ open, onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', shopper: '', price: 0, date: '', photo: '' });
  const [uploading, setUploading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let newValue = value;
    if (type === 'number') {
      newValue = value === '' ? '' : Number(value);      // 빈 문자열일 경우 NaN 방지
    }
    setForm((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToFirebase(file, 'goods');
      setForm((prev) => ({ ...prev, photo: url }));
    } catch (error) {
      console.error('업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
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
          {/* <TextField name="photo" label="사진 URL" value={form.photo} fullWidth margin="dense" onChange={handleChange} />
           */}
          <Stack direction="column" spacing={1}>
            <Button variant="outlined" component="label" disabled={uploading}>
              {uploading ? '업로드 중...' : '사진 업로드'}
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>
            {form.photo && (
              <Typography variant="body2" color="text.secondary">
                업로드 완료: <a href={form.photo} target="_blank" rel="noopener noreferrer">미리보기</a>
              </Typography>
            )}
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
}
