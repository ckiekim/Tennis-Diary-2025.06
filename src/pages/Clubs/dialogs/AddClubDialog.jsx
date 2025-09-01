import React, { useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Avatar, Typography } from '@mui/material';
import { uploadImageToFirebase } from '../../../api/firebaseStorage'; // 기존 이미지 업로드 함수 재사용

/**
 * 새로운 클럽을 생성하는 다이얼로그 컴포넌트
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {function} props.onClose - 다이얼로그 닫기 함수
 * @param {function} props.onAdd - 클럽 추가 로직을 실행하는 함수
 * @param {string} props.uid - 현재 사용자 ID
 */
export default function AddClubDialog({ open, onClose, onAdd, uid }) {
  const [form, setForm] = useState({ name: '', description: '', region: '', profileUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 이미지는 clubs/profile_images/{uuid} 같은 경로에 저장하는 것이 좋습니다.
      const url = await uploadImageToFirebase(file, `clubs/profile_images`);
      setForm((prev) => ({ ...prev, profileUrl: url }));
    } catch (error) {
      console.error('클럽 이미지 업로드 실패:', error);
      alert('이미지 업로드에 실패했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.region.trim()) {
      setError('클럽 이름과 활동 지역은 필수 항목입니다.');
      return;
    }
    setError('');
    onAdd(form);
    // 닫기와 초기화는 onAdd 성공 후에 ClubsPage에서 처리
  };

  // 다이얼로그가 닫힐 때 상태 초기화
  const handleClose = () => {
    onClose();
    setForm({ name: '', description: '', region: '', profileUrl: '' });
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
      <DialogTitle>새 클럽 만들기</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField 
            name="name" 
            label="클럽 이름 (필수)" 
            value={form.name} 
            onChange={handleChange} 
            fullWidth 
            required
          />
          <TextField 
            name="region" 
            label="주요 활동 지역 (필수)" 
            value={form.region} 
            onChange={handleChange} 
            fullWidth 
            required
            placeholder="예: 용인시 기흥구"
          />
          <TextField 
            name="description" 
            label="클럽 소개" 
            value={form.description} 
            onChange={handleChange} 
            multiline 
            rows={3} 
            fullWidth 
            placeholder="클럽의 활동 방식, 분위기 등을 자유롭게 소개해주세요."
          />
          <Stack direction="column" spacing={1} alignItems="center">
            <Button variant="outlined" component="label" disabled={uploading} fullWidth>
              {uploading ? '업로드 중...' : '클럽 대표 사진 업로드'}
              <input hidden accept="image/*" type="file" onChange={handleFileChange} />
            </Button>
            {form.profileUrl && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Avatar 
                  src={form.profileUrl} 
                  alt="클럽 대표 사진 미리보기" 
                  sx={{ width: 120, height: 120 }}
                  variant="rounded"
                />
              </Box>
            )}
          </Stack>
          {error && <Typography color="error" variant="body2" textAlign="center">{error}</Typography>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">클럽 만들기</Button>
      </DialogActions>
    </Dialog>
  );
}
