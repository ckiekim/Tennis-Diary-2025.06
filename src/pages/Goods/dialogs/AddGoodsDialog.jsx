import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';
import { uploadImageToFirebase } from '../../../api/firebaseStorage';
import { handleNumericInputChange } from '../../../utils/handleInput';
import AlertDialog from '../../../components/AlertDialog';

export default function AddGoodsDialog({ open, onClose, onAdd, uid }) {
  const [form, setForm] = useState({ name: '', shopper: '', price: '0', date: '', photo: '', memo: '' });
  const [uploading, setUploading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
      const url = await uploadImageToFirebase(file, `${uid}/goods`);
      setForm((prev) => ({ ...prev, photo: url }));
    } catch (error) {
      console.error('업로드 실패:', error);
      setAlertMessage('이미지 업로드에 실패했습니다.');
      setIsAlertOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name || !form.date) {
      setAlertMessage('용품명과 구매일은 필수 항목입니다.');
      setIsAlertOpen(true);
      return;
    }
    const dataToSave = { ...form, price: Number(form.price), uid, };
    onAdd(dataToSave);
    onClose();
    setForm({ name: '', shopper: '', price: '0', date: '', photo: '', memo: '' });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>용품 구매 추가</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField name="name" label="용품명" value={form.name} onChange={handleChange} fullWidth />
            <TextField name="shopper" label="구매처" value={form.shopper} onChange={handleChange} fullWidth />
            <TextField label="비용" fullWidth type="number" value={form.price || ''} 
              onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })} 
            />
            <TextField name="date" label="구매일" value={form.date} onChange={handleChange} type="date" fullWidth InputLabelProps={{ shrink: true }} />
            <TextField 
              name="memo"  label="메모" value={form.memo} onChange={handleChange} 
              multiline rows={3} fullWidth 
            />
            <Stack direction="column" spacing={1}>
              <Button variant="outlined" component="label" disabled={uploading}>
                {uploading ? '업로드 중...' : '사진 업로드'}
                <input hidden accept="image/*" type="file" onChange={handleFileChange} />
              </Button>
              {/* 이미지 미리보기 */}
              {form.photo && (
                <Box sx={{ mt: 2, textAlign: 'center' }}>
                  <img src={form.photo} alt="미리보기" style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} />
                </Box>
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleSave} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </>
  );
}
