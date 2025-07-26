import React, { useState } from 'react';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, List, ListItem, Stack, TextField, Tooltip, Typography } from '@mui/material';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../api/firebaseConfig'; 
import { v4 as uuidv4 } from 'uuid';

export default function AddPhotoDialog({ open, onClose, item, onAdd }) {
  const [memo, setMemo] = useState('');
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleSubmit = async () => {
    setUploading(true);
    try {
      const urls = [];

      for (let file of files) {
        const fileRef = ref(storage, `results/${uuidv4()}-${file.name}`);
        await uploadBytes(fileRef, file);
        const url = await getDownloadURL(fileRef);
        urls.push(url);
      }

      // onAdd로 결과 전달
      await onAdd(item.id, { memo, photos: urls });
      onClose();
      setMemo('');
      setFiles([]);
    } catch (err) {
      console.error('업로드 실패:', err);
      alert('업로드 중 문제가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>사진 / 메모 추가</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
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
        <Button onClick={(e) => { e.stopPropagation(); onClose(); }} disabled={uploading}>
          취소
        </Button>
        <Button onClick={(e) => { e.stopPropagation(); handleSubmit(); }} variant="contained" disabled={uploading}>
          {uploading ? '업로드 중...' : '저장'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
