import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, ImageList, ImageListItem,
  InputLabel, MenuItem, Select, Stack, TextField, Typography 
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import useCourtList from '../../../hooks/useCourtList';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../api/firebaseConfig';
import { uploadImageToFirebase, deletePhotoFromStorage } from '../../../api/firebaseStorage';
import formatDay from '../../../utils/formatDay';
import { handleNumericInputChange } from '../../../utils/handleInput';
import { stringToResults, resultsToString } from '../../../utils/resultConverter';
import { gameTypes } from '../../../constants/typeGames';
import { v4 as uuidv4 } from 'uuid';
import AlertDialog from '../../../components/AlertDialog';

export default function EditGameDialog({ open, onClose, result, uid, resultData }) {
  const [form, setForm] = useState({ ...result, photoList: result.photoList || [] });
  const [results, setResults] = useState([]);
  const courts = useCourtList();
  const [newFiles, setNewFiles] = useState([]);
  const [updating, setUpdating] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    setForm({ ...result });
    setResults(result.result ? stringToResults(result.result) : [{ id: uuidv4(), type: '', win: '', draw: '0', loss: '' }]);
    setNewFiles([]);
  }, [open, result]);

  const handleResultChange = (id, field, value) => {
    setResults(results.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };
  
  const handleAddResult = () => {
    setResults([...results, { id: uuidv4(), type: '', win: '', draw: '0', loss: '' }]);
  };
  
  const handleRemoveResult = (id) => {
    setResults(results.filter(r => r.id !== id));
  };

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
      // 사진 관리 로직
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
      
      // 업데이트 로직 분리
      // Part 1: events 문서 업데이트
      const eventDocRef = doc(db, 'events', result.id);
      await updateDoc(eventDocRef, {
        place: form.place,
        source: form.source,
        price: Number(form.price) || 0,
      });

      // Part 2: event_results 문서 업데이트 (결과가 있는 경우에만)
      if (resultData?.id) {
        const resultDocRef = doc(db, 'events', result.id, 'event_results', resultData.id);
        const resultString = resultsToString(results);
        await updateDoc(resultDocRef, {
          result: resultString,
          memo: form.memo,
          photoList: finalPhotoList,
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
            <Stack spacing={1}>
              {results.map((resultItem) => (
                <Box key={resultItem.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                  <Stack spacing={2}>
                    <FormControl fullWidth size="small">
                      <InputLabel>종목</InputLabel>
                      <Select
                        label="종목" size="small"
                        value={resultItem.type} 
                        onChange={(e) => handleResultChange(resultItem.id, 'type', e.target.value)}
                      >
                        {gameTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField label="승" type="number" size="small" value={resultItem.win} onChange={(e) => handleResultChange(resultItem.id, 'win', e.target.value)} sx={{ flex: 1 }} />
                      <TextField label="무" type="number" size="small" value={resultItem.draw} onChange={(e) => handleResultChange(resultItem.id, 'draw', e.target.value)} sx={{ flex: 1 }} />
                      <TextField label="패" type="number" size="small" value={resultItem.loss} onChange={(e) => handleResultChange(resultItem.id, 'loss', e.target.value)} sx={{ flex: 1 }} />
                      {results.length > 1 && (
                        <IconButton onClick={() => handleRemoveResult(resultItem.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </Stack>
                  </Stack>
                </Box>
              ))}
              <Button variant="outlined" startIcon={<AddCircleOutlineIcon />} onClick={handleAddResult}>
                종목 추가
              </Button>
            </Stack>
            <TextField
              label="소스" fullWidth value={form?.source || ''} size='small'
              onChange={(e) => setForm({ ...form, source: e.target.value })}
            />
            <TextField
              label="비용" fullWidth type="number" value={form.price || ''} size='small'
              onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
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
          <Button onClick={onClose} disabled={updating}>취소</Button>
          <Button variant="contained" onClick={handleUpdate} disabled={updating}>
            {updating ? '저장 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </>
  );
}