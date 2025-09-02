import React, { useState, useEffect } from 'react';
import { Avatar, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField, Typography } from '@mui/material';
import { uploadImageToFirebase } from '../../../api/firebaseStorage';

/**
 * 기존 클럽 정보를 수정하는 다이얼로그 컴포넌트
 * @param {object} props
 * @param {boolean} props.open - 다이얼로그 열림 상태
 * @param {function} props.onClose - 다이얼로그 닫기 함수
 * @param {function} props.onUpdate - 클럽 수정 로직을 실행하는 함수
 * @param {object} props.clubData - 수정할 클럽의 기존 데이터
 * @param {string} props.clubId - 수정할 클럽의 문서 ID
 */
export default function EditClubDialog({ open, onClose, onUpdate, clubData, clubId }) {
  const [form, setForm] = useState({ name: '', description: '', region: '', profileUrl: '' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  // 다이얼로그가 열리거나 clubData가 변경될 때마다 form 상태를 초기화합니다.
  useEffect(() => {
    if (clubData) {
      setForm({
        name: clubData.name || '',
        description: clubData.description || '',
        region: clubData.region || '',
        profileUrl: clubData.profileUrl || '',
      });
    }
  }, [clubData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      // 기존 이미지와 다른 파일일 경우에만 업로드하거나, 덮어쓰는 정책으로 갑니다.
      // 경로에 clubId를 포함하여 어떤 클럽의 이미지인지 명확하게 합니다.
      const url = await uploadImageToFirebase(file, `clubs/profile_images/${clubId}`);
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
    // 변경된 form 데이터와 clubId를 부모 컴포넌트로 전달
    onUpdate(clubId, form);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>클럽 정보 수정</DialogTitle>
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
              {uploading ? '업로드 중...' : '대표 사진 변경'}
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
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleSave} variant="contained">저장하기</Button>
      </DialogActions>
    </Dialog>
  );
}