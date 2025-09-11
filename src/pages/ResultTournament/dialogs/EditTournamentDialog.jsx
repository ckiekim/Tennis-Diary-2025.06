import React, { useEffect, useState } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, ImageList, ImageListItem,
  MenuItem, Stack, TextField, Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';
import { handleNumericInputChange } from '../../../utils/handleInput';
import { tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions } from '../../../data/tournamentConstants';
import AlertDialog from '../../../components/AlertDialog';

export default function EditTournamentDialog({ open, onClose, result, uid, resultData }) {
  const [form, setForm] = useState({ ...result, photoList: result.photoList || [] });
  const [newFiles, setNewFiles] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

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
    setUpdating(true);
    try {
      const originalUrls = result.photoList || [];
      const currentUrls = form.photoList || [];
      const removedUrls = originalUrls.filter((url) => !currentUrls.includes(url));
      for (const url of removedUrls) {
        await deletePhotoFromStorage(url);
      }
      const newPhotoUrls = [];
      for (const file of newFiles) {
        const url = await uploadImageToFirebase(file, `${uid}/results`);
        newPhotoUrls.push(url);
      }
      const finalPhotoList = [...currentUrls, ...newPhotoUrls];
      
      // Part 1: 'events' 문서 업데이트
      const eventDocRef = doc(db, 'events', result.id);
      await updateDoc(eventDocRef, {
        name: form.name, place: form.place, category: form.category,
        partner: form.partner, organizer: form.organizer, division: form.division,
      });
      // Part 2: 'event_results' 문서 업데이트 또는 생성
      const resultDataToSave = {
        result: form.result || '', price: Number(form.price) || 0, memo: form.memo || '',
        photoList: finalPhotoList, uid: uid, eventId: result.id,
      };

      if (resultData?.id) {
        // 결과 문서가 있으면 업데이트
        const resultDocRef = doc(db, 'events', result.id, 'event_results', resultData.id);
        await updateDoc(resultDocRef, resultDataToSave);
      } else {
        // 결과 문서가 없으면 새로 생성
        const resultsCollectionRef = collection(db, 'events', result.id, 'event_results');
        await addDoc(resultsCollectionRef, {
          ...resultDataToSave,
          createdAt: serverTimestamp(),
        });
      }

      onClose();
    } catch (err) {
      console.error('업데이트 실패:', err);
      setAlertMessage('업데이트 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth>
        <DialogTitle>대회 상세 수정</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={0.5}>
            <TextField label="대회명" fullWidth value={form.name || ''} size='small' onChange={(e) => setForm({ ...form, name: e.target.value })}/>
            <TextField label="장소" fullWidth value={form.place || ''} size='small' onChange={(e) => setForm({ ...form, place: e.target.value })}/>
            <TextField label="참가종목" select fullWidth value={form.category || ''} size='small' onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
            </TextField>
            <TextField label="파트너" fullWidth value={form.partner || ''} size='small' onChange={(e) => setForm({ ...form, partner: e.target.value })} />
            <TextField label="주관" select fullWidth value={form.organizer || ''} size='small' onChange={(e) => setForm({ ...form, organizer: e.target.value, division: '' })}>
              {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
            </TextField>
            {form.organizer && (
              <TextField label="참가부문" select fullWidth value={form.division || ''} size='small' onChange={(e) => setForm({ ...form, division: e.target.value })}>
                {(form.organizer === 'KATA' ? kataDivisions : katoDivisions).map(div => <MenuItem key={div} value={div}>{div}</MenuItem>)}
              </TextField>
            )}
            <TextField label="결과" fullWidth value={form?.result || ''} size='small' onChange={(e) => setForm({ ...form, result: e.target.value })}/>
            <TextField label="참가비" fullWidth type="number" value={form.price || ''} size='small' onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}/>
            <TextField label="메모" fullWidth value={form?.memo || ''} size='small' onChange={(e) => setForm({ ...form, memo: e.target.value })}/>

            <Button variant="outlined" component="label" onClick={(e) => e.stopPropagation()}>
              📷 사진 업로드
              <input hidden multiple accept="image/*" type="file" onChange={handleFileChange} />
            </Button>

            {form.photoList && form.photoList.length > 0 && (
              <ImageList cols={3} gap={8}>
                {form.photoList.map((url, index) => (
                  <ImageListItem key={index}>
                    <img src={url} alt={`preview-${index}`} loading="lazy" />
                    <IconButton size="small" color="error" onClick={() => handleImageDelete(index)} sx={{ position: 'absolute', top: 2, right: 2 }} >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </ImageListItem>
                ))}
              </ImageList>
            )}

            {newFiles.length > 0 && <Typography variant="caption" color="text.secondary">새 이미지 {newFiles.length}개 선택됨</Typography>}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={updating}>취소</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating}>{updating ? '저장 중...' : '저장'}</Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </>
  );
}