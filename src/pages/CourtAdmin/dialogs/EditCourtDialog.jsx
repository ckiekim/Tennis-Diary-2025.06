import React, { useState, useEffect } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, IconButton, Paper, Stack, TextField, Typography,
} from '@mui/material';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';
import AlertDialog from '../../../components/AlertDialog';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const EditCourtDialog = ({ open, onClose, court, onUpdate }) => {
  const [form, setForm] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (court) {
      setForm({
        ...court,
        // details 배열 각 항목에 UI 상태를 위한 'uploading' 플래그 추가
        details: court.details ? court.details.map(d => ({ ...d, uploading: false })) : []
      });
    }
  }, [court]);

  if (!form) return null;

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...form.details];
    newDetails[index][name] = value;
    setForm(prev => ({ ...prev, details: newDetails }));
  };

  const handleFileChange = async (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    let newDetails = [...form.details];
    const oldPhotoUrl = newDetails[index].photo;
    newDetails[index].uploading = true;
    setForm(prev => ({ ...prev, details: newDetails }));

    try {
      const newPhotoUrl = await uploadImageToFirebase(file, 'courts');
      if (oldPhotoUrl) await deletePhotoFromStorage(oldPhotoUrl);
      
      newDetails = [...form.details];
      newDetails[index].photo = newPhotoUrl;
    } catch (error) {
      setAlertMessage('사진 변경 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      newDetails[index].uploading = false;
      setForm(prev => ({ ...prev, details: newDetails }));
    }
  };

  const handleAddDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { type: '실내', surface: '하드', photo: '', uploading: false }]
    }));
  };
  
  const handleRemoveDetail = (index) => {
    const newDetails = form.details.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, details: newDetails }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.location || form.details.length === 0) {
      setAlertMessage('이름, 위치, 그리고 최소 1개의 코트 상세 정보는 필수입니다.');
      setIsAlertOpen(true);
      return;
    }
    
    // --- 변경점 시작 ---
    // 호환성 로직 제거: 더 이상 is_indoor 등 옛날 필드를 정리할 필요가 없습니다.
    const finalForm = {
      ...form,
      // 저장 시에는 UI 상태인 'uploading' 플래그만 제거합니다.
      details: form.details.map(({ uploading, ...rest }) => rest)
    };
    // --- 변경점 끝 ---
    
    onUpdate(finalForm);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>테니스 코트 수정</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="dense" label="코트 이름" name="name" value={form.name || ''}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label="위치" name="location" value={form.location || ''}
            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
          />
          <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>코트 상세 정보</Typography>
          <Stack spacing={2}>
            {form.details.map((detail, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 2, position: 'relative' }}>
                <IconButton
                  size="small"
                  onClick={() => handleRemoveDetail(index)}
                  sx={{ position: 'absolute', top: 4, right: 4 }}
                  disabled={form.details.length <= 1}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                  <TextField select label="타입" name="type" value={detail.type} onChange={(e) => handleDetailChange(index, e)} size="small">
                    <MenuItem value="실내">실내</MenuItem>
                    <MenuItem value="실외">실외</MenuItem>
                  </TextField>
                  <TextField select label="서페이스" name="surface" value={detail.surface} onChange={(e) => handleDetailChange(index, e)} size="small">
                    <MenuItem value="하드">하드</MenuItem>
                    <MenuItem value="인조잔디">인조잔디</MenuItem>
                    <MenuItem value="클레이">클레이</MenuItem>
                  </TextField>
                </Stack>
                <Button variant="outlined" component="label" size="small" disabled={detail.uploading}>
                  {detail.uploading ? '업로드 중...' : '사진 선택'}
                  <input hidden type="file" onChange={(e) => handleFileChange(index, e)} />
                </Button>
                {detail.photo && <img src={detail.photo} alt="미리보기" style={{ width: '100px', height: '100px', objectFit: 'cover', marginLeft: '10px' }} />}
              </Paper>
            ))}
            <Button startIcon={<AddCircleOutlineIcon />} onClick={handleAddDetail}>
              코트 상세 정보 추가
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit} variant="contained">저장</Button>
        </DialogActions>
      </Dialog>
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>{alertMessage}</AlertDialog>
    </>
  );
};

export default EditCourtDialog;