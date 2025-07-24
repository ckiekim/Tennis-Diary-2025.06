import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from '@mui/material';

export default function ResultDialog({memoOpen, memoTarget, setMemoOpen, setMemoTarget, onResult}) {
  return (
    <Dialog open={memoOpen} onClose={() => setMemoOpen(false)} fullWidth>
      <DialogTitle>결과 입력</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="결과 (예: 남복 4-0-0)" fullWidth value={memoTarget?.result || ''}
            onChange={(e) =>
              setMemoTarget({ ...memoTarget, result: e.target.value })
            }
          />
          <TextField
            label="비용 (숫자)" fullWidth type="number" value={memoTarget?.price || ''}
            onChange={(e) => setMemoTarget({ ...memoTarget, price: Number(e.target.value) })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setMemoOpen(false)}>취소</Button>
        <Button variant="contained" onClick={onResult}>
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}