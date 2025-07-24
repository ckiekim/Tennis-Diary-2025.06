import React, { useState, useEffect } from 'react';
import {
  Box, Button, Checkbox, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, MenuItem, TextField, Typography
} from '@mui/material';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';

const EditCourtDialog = ({ open, onClose, court, onUpdate }) => {
  const [form, setForm] = useState(court);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setForm(court);
  }, [court]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setForm((prev) => ({ ...prev, is_indoor: e.target.checked }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const photoUrl = await uploadImageToFirebase(file, 'courts');
      await deletePhotoFromStorage(form.photo);
      setForm((prev) => ({ ...prev, photo: photoUrl }));
    } catch (error) {
      console.error('파일 업로드/삭제 실패:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    if (!form.name || !form.location || !form.surface) {
      alert('이름, 위치, 서페이스는 필수 항목입니다.');
      return;
    }
    onUpdate(form);
    onClose();
  };

  if (!form) return null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>테니스 코트 수정</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth margin="dense" label="이름" name="name" value={form.name || ''}
          onChange={handleChange}
        />
        <TextField
          fullWidth margin="dense" label="위치" name="location" value={form.location || ''}
          onChange={handleChange}
        />
        <TextField
          select fullWidth margin="dense" label="서페이스" name="surface" value={form.surface || ''}
          onChange={handleChange}
        >
          <MenuItem value="하드">하드</MenuItem>
          <MenuItem value="인조잔디">인조잔디</MenuItem>
          <MenuItem value="클레이">클레이</MenuItem>
        </TextField>
        <FormControlLabel
          control={<Checkbox checked={form.is_indoor || false} onChange={handleCheckboxChange} />}
          label="실내 코트"
        />

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
        {form.photo && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <img src={form.photo} alt="미리보기" style={{ width: '50%' }} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCourtDialog;
