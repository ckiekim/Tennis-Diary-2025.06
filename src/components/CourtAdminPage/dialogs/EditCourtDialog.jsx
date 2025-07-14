import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, FormControlLabel, Checkbox, MenuItem
} from '@mui/material';

const EditCourtDialog = ({ open, onClose, court, onUpdate }) => {
  const [form, setForm] = useState(court);

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
        <TextField
          fullWidth margin="dense" label="사진 URL" name="photo" value={form.photo || ''}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSubmit} variant="contained">저장</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCourtDialog;
