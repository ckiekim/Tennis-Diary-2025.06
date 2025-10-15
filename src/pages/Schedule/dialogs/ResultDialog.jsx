import React, { useEffect, useState } from 'react';
import { 
  Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, IconButton, InputLabel, MenuItem,
  List, ListItem, Select, Stack, TextField, Tooltip, Typography 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteIcon from '@mui/icons-material/Delete';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../api/firebaseConfig'; 
import { v4 as uuidv4 } from 'uuid';
import { resultsToString } from '../../../utils/resultConverter';
import { gameTypes } from '../../../constants/global';
import AlertDialog from '../../../components/AlertDialog';

export default function ResultDialog({open, target, setOpen, onResult, uid}) {
  const [results, setResults] = useState([]);
  const [memo, setMemo] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const isGame = target?.type === '게임' || target?.type === '정모';

  useEffect(() => {
    if (open) {
      setResults([{ id: uuidv4(), type: '', win: '', draw: '0', loss: '' }]);
      setMemo(target?.memo || '');
      setFiles([]);
    }
  }, [open, target]);

  const handleClose = () => {
    setOpen(false);
  };

  // 결과 항목(종목, 승/무/패) 변경 핸들러
  const handleResultChange = (id, field, value) => {
    setResults(results.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };
  
  // 새로운 결과 입력 필드 추가 핸들러
  const handleAddResult = () => {
    setResults([...results, { id: uuidv4(), type: '', win: '', draw: '0', loss: '' }]);
  };
  
  // 결과 입력 필드 삭제 핸들러
  const handleRemoveResult = (id) => {
    setResults(results.filter(r => r.id !== id));
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      // 데이터 유효성 검사 (빈 값이 있는지 확인)
      if (isGame) {
        const isInvalid = results.some(r => !r.type || r.win === '' || r.draw === '' || r.loss === '');
        if (isInvalid) {
          setAlertMessage('모든 종목과 승/무/패 값을 입력해주세요.');
          setIsAlertOpen(true);
          setUploading(false);
          setUploading(false);
          return;
        }
      }

      const urls = [];
      for (let file of files) {
        const fileRef = ref(storage, `${uid}/results/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      const resultStr = isGame ? resultsToString(results) : results[0].type;
      await onResult(target.id, { type: target.type, result: resultStr, memo, photoList: urls });
      handleClose();
    } catch (err) {
      console.error('업로드 실패:', err);
      setAlertMessage('업로드 중 문제가 발생했습니다.');
      setIsAlertOpen(true);;
    } finally {
      setUploading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>결과 입력</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            {isGame ? (
              <Stack spacing={1}>
                {/* 6. results 배열을 map으로 순회하며 동적으로 입력 필드 생성 */}
                {results.map((resultItem, index) => (
                  <Box key={resultItem.id} sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: '8px' }}>
                    <Stack spacing={2}>
                      <FormControl fullWidth size="small">
                        <InputLabel>종목</InputLabel>
                        <Select
                          label="종목" size="small" value={resultItem.type}
                          onChange={(e) => handleResultChange(resultItem.id, 'type', e.target.value)}
                        >
                          {gameTypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
                        </Select>
                      </FormControl>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <TextField label="승" type="number" size="small" value={resultItem.win} onChange={(e) => handleResultChange(resultItem.id, 'win', e.target.value)} sx={{ flex: 1 }} />
                        <TextField label="무" type="number" size="small" value={resultItem.draw} onChange={(e) => handleResultChange(resultItem.id, 'draw', e.target.value)} sx={{ flex: 1 }} />
                        <TextField label="패" type="number" size="small" value={resultItem.loss} onChange={(e) => handleResultChange(resultItem.id, 'loss', e.target.value)} sx={{ flex: 1 }} />
                        {/* 결과 필드가 2개 이상일 때만 삭제 버튼 표시 */}
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
            ) : (
              <TextField
                label="결과 (예: 예선 통과, 16강)"
                fullWidth
                value={results[0]?.type || ''} // 호환성을 위해 results[0] 사용
                onChange={(e) => setResults([{ ...results[0], type: e.target.value }])}
              />
            )}

            <TextField 
              label="메모" fullWidth multiline rows={3} value={memo}
              onChange={(e) => setMemo(e.target.value)} onClick={(e) => e.stopPropagation()}
            />
            <Button variant="outlined" component="label" onClick={(e) => e.stopPropagation()}>
              📷 사진 업로드
              <input hidden multiple accept="image/*" type="file" onChange={handleFileChange} />
            </Button>
            {files.length > 0 && (
              <List>
                {files.map((file, idx) => (
                  <ListItem key={idx}>
                    <Tooltip title={file.name}>
                      <Typography
                        variant="body2"
                        sx={{ fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '100%', }}
                      >
                        {file.name}
                      </Typography>
                    </Tooltip>
                  </ListItem>
                ))}
              </List>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} disabled={uploading}>취소</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={uploading}>
            {uploading ? '업로드 중...' : '저장'}
          </Button>
        </DialogActions>
      </Dialog>
    
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </>
  );
}