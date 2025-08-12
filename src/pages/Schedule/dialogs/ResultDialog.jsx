import React, { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../api/firebaseConfig'; 
import { v4 as uuidv4 } from 'uuid';

export default function ResultDialog({open, target, setOpen, onResult, uid}) {
  const [result, setResult] = useState('');
  const [memo, setMemo] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      setResult(target?.result || '');
      setMemo(target?.memo || '');
      setFiles([]);
    }
  }, [open, target]);

  const handleClose = () => {
    setOpen(false);
    setResult('');
    setMemo('');
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const urls = [];

      for (let file of files) {
        const fileRef = ref(storage, `${uid}/results/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      // onResult로 결과 전달
      await onResult(target.id, { result, memo, photoList: urls });
      handleClose();
    } catch (err) {
      console.error('업로드 실패:', err);
      alert('업로드 중 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  const isTournament = target?.type === '대회';

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>결과 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label={isTournament ? "결과 (예: 예선 통과, 16강)" : "결과 (예: 남복 4-0-0)"} 
            fullWidth value={result}
            onChange={(e) => setResult(e.target.value)}
          />
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
  );
}