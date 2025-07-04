import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';

export default function UpdateScheduleDialog({courts, editOpen, editingSchedule, setEditOpen, setEditingSchedule, onUpdate}) {
  return (
    <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth>
      <DialogTitle>일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth value={editingSchedule?.type || ''}
            onChange={(e) => setEditingSchedule({ ...editingSchedule, type: e.target.value })}
          >
            <MenuItem value="레슨">레슨</MenuItem>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="대회">대회</MenuItem>
            <MenuItem value="기타">기타</MenuItem>
          </TextField>
          <TextField
            label="시작 시간" fullWidth value={editingSchedule?.start_time || ''}
            onChange={(e) => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })}
          />
          <TextField
            label="종료 시간" fullWidth value={editingSchedule?.end_time || ''}
            onChange={(e) => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })}
          />
          <TextField
            label="장소" select fullWidth value={editingSchedule?.place || ''}
            onChange={(e) => setEditingSchedule({ ...editingSchedule, place: e.target.value })}>
            {courts.map((court) => (
              <MenuItem key={court.id} value={court.name}>
                {court.name} ({court.surface})
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="소스" fullWidth value={editingSchedule?.source || ''}
            onChange={(e) => setEditingSchedule({ ...editingSchedule, source: e.target.value })}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditOpen(false)}>취소</Button>
        <Button variant="contained" onClick={onUpdate}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}