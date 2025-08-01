import React, { useEffect, useState } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ImageList, ImageListItem,
  MenuItem, Stack, TextField, Typography 
} from '@mui/material';
import useCourtList from '../../../hooks/useCourtList';
import formatDay from '../../../utils/formatDay';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';
import DeleteIcon from '@mui/icons-material/Delete';

export default function EditResultDialog({ open, onClose, result, uid }) {
  const [form, setForm] = useState({ ...result, photoList: result.photoList || [] });
  const courts = useCourtList();
  const [newFiles, setNewFiles] = useState([]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setForm({ ...result });
    setNewFiles([]);
  }, [result]);

  const handleFileChange = (e) => {
    setNewFiles([...e.target.files]);
  };

  const handleImageDelete = (index) => {
    const updatedPhotos = [...form.photoList];
    updatedPhotos.splice(index, 1);
    setForm({ ...form, photoList: updatedPhotos });
  };

  const handleUpdate = async () => {
    setDeleting(true);
    try {
      // 🔍 기존 이미지 중에서 제거된 항목만 찾기
      const originalUrls = result.photoList || [];
      const currentUrls = form.photoList || [];

      const removedUrls = originalUrls.filter((url) => !currentUrls.includes(url));

      // 1. 삭제할 이미지만 Storage에서 제거
      for (const url of removedUrls) {
        await deletePhotoFromStorage(url);
      }

      // 2. 새 사진 업로드
      const newPhotoUrls = [];
      for (const file of newFiles) {
        const url = await uploadImageToFirebase(file, `${uid}/results`);
        newPhotoUrls.push(url);
      }

      // 3. 유지할 기존 이미지 + 새 이미지 결합
      const finalPhotoList = [...currentUrls, ...newPhotoUrls];

      // 4. Firestore 업데이트
      const docRef = doc(db, 'events', result.id);
      await updateDoc(docRef, {
        place: form.place,
        result: form.result,
        source: form.source,
        price: form.price,
        memo: form.memo,
        photoList: finalPhotoList,
      });

      onClose();
    } catch (err) {
      console.error('업데이트 실패:', err);
      alert('업데이트 중 오류 발생');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>게임 상세 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={0.5}>
          <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
            일시: {`${result.date} (${formatDay(result.date)}) ${result.time}`}
          </Typography>
          <TextField
            label="장소" select fullWidth value={form?.place || ''} size='small'
            onChange={(e) => setForm({ ...form, place: e.target.value })}>
            {courts.map((court) => (
              <MenuItem key={court.id} value={court.name}>
                {court.name} ({court.surface})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="결과" fullWidth value={form?.result || ''} size='small'
            onChange={(e) => setForm({ ...form, result: e.target.value })}
          />
          <TextField
            label="소스" fullWidth value={form?.source || ''} size='small'
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <TextField
            label="비용" fullWidth type="number" value={form.price || ''} size='small'
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
          <TextField
            label="메모" fullWidth value={form?.memo || ''} size='small'
            onChange={(e) => setForm({ ...form, memo: e.target.value })}
          />

          <Button variant="outlined" component="label" onClick={(e) => e.stopPropagation()}>
            📷 사진 업로드
            <input hidden multiple accept="image/*" type="file" onChange={handleFileChange} />
          </Button>

          {/* 미리보기 삭제 가능한 사진 리스트 */}
          {form.photoList && form.photoList.length > 0 && (
            <ImageList cols={3} gap={8}>
              {form.photoList.map((url, index) => (
                <ImageListItem key={index}>
                  <img src={url} alt={`preview-${index}`} loading="lazy" />
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleImageDelete(index)}
                    sx={{ position: 'absolute', top: 2, right: 2 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}

          {newFiles.length > 0 && (
            <Typography variant="caption" color="text.secondary">
              새 이미지 {newFiles.length}개 선택됨
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={deleting}>취소</Button>
        <Button variant="contained" onClick={handleUpdate} disabled={deleting}>
          {deleting ? '저장 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}