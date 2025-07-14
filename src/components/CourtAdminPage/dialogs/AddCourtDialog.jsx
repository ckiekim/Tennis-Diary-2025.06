import React, { useState } from 'react';
import {
  Button, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, MenuItem, TextField, 
} from '@mui/material';

const AddCourtDialog = ({ open, onClose, onSave }) => {
  const [form, setForm] = useState({ name: '', location: '', surface: '', is_indoor: false, photo: ''  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e) => {
    setForm((prev) => ({ ...prev, is_indoor: e.target.checked }));
  };

  const handleSubmit = () => {
    if (form.name.trim() === '' || form.location.trim() === '') {
      alert('이름과 위치는 필수 입력입니다.');
      return;
    }
    onSave(form);
    onClose();
    setForm({ name: '', location: '', surface: '', is_indoor: false, photo: '' });
  };

  return (
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
        <TextField
          fullWidth margin="dense" label="사진 URL" name="photo" value={form.photo}
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

export default AddCourtDialog;
