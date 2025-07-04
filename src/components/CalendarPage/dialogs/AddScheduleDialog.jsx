import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';

export default function AddScheduleDialog({courts, open, form, setOpen, setForm, onAddSchedule}) {
  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>일정 추가</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="레슨">레슨</MenuItem>
            <MenuItem value="대회">대회</MenuItem>
            <MenuItem value="기타">기타</MenuItem>
          </TextField>
          <TextField
            label="시작 시간 (예: 10:00)" fullWidth value={form.start_time}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
          <TextField
            label="종료 시간 (예: 13:00)" fullWidth value={form.end_time}
            onChange={(e) => setForm({ ...form, end_time: e.target.value })}
          />
          <TextField
            label="장소" select fullWidth value={form.place}
            onChange={(e) => setForm({ ...form, place: e.target.value })}>
            {courts.map((court) => (
              <MenuItem key={court.id} value={court.name}>
                {court.name} ({court.surface})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="소스" fullWidth value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>취소</Button>
        <Button onClick={onAddSchedule} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}