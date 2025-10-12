import React, { useEffect, useState } from 'react';
import {
  Button, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Stack, TextField, Typography, IconButton, Paper
} from '@mui/material';
import { uploadImageToFirebase } from '../../../api/firebaseStorage';
import AlertDialog from '../../../components/AlertDialog';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';

const initialDetail = { type: '실내', surface: '하드', photo: '', uploading: false };
const initialForm = { name: '', location: '', details: [initialDetail] };

const AddCourtDialog = ({ open, onClose, onSave, initialData }) => {
  const [form, setForm] = useState(initialForm);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({
          ...initialForm, // location, details는 초기화
          name: initialData.name || '',
        });
      } else {
        setForm(initialForm);
      }
    }
  }, [open, initialData]);

  const handleDetailChange = (index, e) => {
    const { name, value } = e.target;
    const newDetails = [...form.details];
    newDetails[index][name] = value;
    setForm(prev => ({ ...prev, details: newDetails }));
  };

  const handleFileChange = async (index, e) => {
    const file = e.target.files[0];
    if (!file) return;

    let newDetails = [...form.details];
    newDetails[index].uploading = true;
    setForm(prev => ({ ...prev, details: newDetails }));

    try {
      const url = await uploadImageToFirebase(file, 'courts');
      newDetails = [...form.details];
      newDetails[index].photo = url;
    } catch (err) {
      setAlertMessage('사진 업로드에 실패했습니다.');
      setIsAlertOpen(true);
    } finally {
      newDetails[index].uploading = false;
      setForm(prev => ({ ...prev, details: newDetails }));
    }
  };

  const handleAddDetail = () => {
    setForm(prev => ({
      ...prev,
      details: [...prev.details, { ...initialDetail }]
    }));
  };
  
  const handleRemoveDetail = (index) => {
    const newDetails = form.details.filter((_, i) => i !== index);
    setForm(prev => ({ ...prev, details: newDetails }));
  };

  const handleSubmit = () => {
    if (form.name.trim() === '' || form.location.trim() === '' || form.details.length === 0) {
      setAlertMessage('이름, 위치, 그리고 최소 1개의 코트 상세 정보는 필수입니다.');
      setIsAlertOpen(true);
      return;
    }
    // uploading 상태가 없는 순수한 데이터만 저장
    const finalForm = {
      ...form,
      details: form.details.map(({ uploading, ...rest }) => rest)
    };
    onSave(finalForm);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>테니스 코트 추가</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth margin="dense" label="코트 이름 (예: 수지체육공원)" name="name" value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
          />
          <TextField
            fullWidth margin="dense" label="위치 (예: 경기도 용인시 수지구)" name="location" value={form.location}
            onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
          />

          {/* --- 변경점: details 배열을 순회하며 UI 렌더링 --- */}
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

export default AddCourtDialog;