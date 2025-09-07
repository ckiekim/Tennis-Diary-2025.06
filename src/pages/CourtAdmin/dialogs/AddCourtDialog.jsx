import React, { useState } from 'react';
import {
  Box, Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, MenuItem, Stack, TextField
} from '@mui/material';
import { uploadImageToFirebase } from '../../../api/firebaseStorage';
import AlertDialog from '../../../components/AlertDialog';

const AddCourtDialog = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', location: '', surface: '', is_indoor: false, photo: ''  });
  const [uploading, setUploading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setForm((prev) => ({ ...prev, is_indoor: e.target.checked }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const url = await uploadImageToFirebase(file, 'courts');
      setForm((prev) => ({ ...prev, photo: url }));
    } catch (err) {
      setAlertMessage('사진 업로드에 실패했습니다.');
      setIsAlertOpen(true);
    }
    setUploading(false);
  };

  const handleSubmit = () => {
    if (form.name.trim() === '' || form.location.trim() === '') {
      setAlertMessage('이름과 위치는 필수 입력입니다.');
      setIsAlertOpen(true);
      return;
    }
    onSave(form);
    onClose();
    setForm({ name: '', location: '', surface: '', is_indoor: false, photo: '' });
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>테니스 코트 추가</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="dense" label="이름" name="name" value={form.name}
            onChange={handleChange}
          />
          <TextField
            fullWidth margin="dense" label="위치" name="location" value={form.location}
            onChange={handleChange}
          />
          <TextField
            select fullWidth margin="dense" label="서페이스" name="surface"
            value={form.surface} onChange={handleChange}
          >
            <MenuItem value="하드">하드</MenuItem>
            <MenuItem value="인조잔디">인조잔디</MenuItem>
            <MenuItem value="클레이">클레이</MenuItem>
          </TextField>
          <FormControlLabel
            control={<Checkbox checked={form.is_indoor} onChange={handleCheckboxChange} />}
            label="실내 코트"
          />

          <Stack direction="column" spacing={1}>
            <Button variant="outlined" component="label" disabled={uploading}>
              {uploading ? '업로드 중...' : '사진 업로드'}
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>

            {/* 이미지 미리보기 */}
            {form.photo && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <img src={form.photo} alt="미리보기" style={{ width: '50%' }} />
              </Box>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </>
  );
};

export default AddCourtDialog;
