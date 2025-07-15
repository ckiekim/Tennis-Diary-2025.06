import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';

export default function EditScheduleDialog({courts, open, selectedSchedule, setOpen, setSelectedSchedule, onUpdate}) {
  if (!selectedSchedule) return null;
  const isStringReplace = selectedSchedule.type === "스트링 교체";
  const isLesson = selectedSchedule.type === "레슨";

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth value={selectedSchedule?.type || ''}
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, type: e.target.value })}
          >
            <MenuItem value="레슨">레슨</MenuItem>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="대회">대회</MenuItem>
            <MenuItem value="스트링 교체">스트링 교체</MenuItem>
          </TextField>
          {isStringReplace ? (
            <>
              <TextField
                label="스트링" fullWidth value={selectedSchedule.string || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, string: e.target.value })}
              />
              <TextField
                label="텐션" fullWidth value={selectedSchedule.tension || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, tension: e.target.value })}
              />
              <TextField
                label="교체 장소" fullWidth value={selectedSchedule.place || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, place: e.target.value })}
              />
              <TextField
                label="비용" fullWidth type="number" value={selectedSchedule.price || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, price: Number(e.target.value) })}
              />
            </>
          ) : (
            <>
              <TextField
                label="시작 시간" fullWidth value={selectedSchedule?.start_time || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, start_time: e.target.value })}
              />
              <TextField
                label="종료 시간" fullWidth value={selectedSchedule?.end_time || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, end_time: e.target.value })}
              />
              <TextField
                label="장소" select fullWidth value={selectedSchedule?.place || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, place: e.target.value })}>
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.name}>
                    {court.name} ({court.surface})
                  </MenuItem>
                ))}
              </TextField>
              { isLesson ? (
                <TextField
                  label="비용" fullWidth type="number" value={selectedSchedule.price || ''}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, price: Number(e.target.value) })}
                />
              ) : (
                <TextField
                  label="소스" fullWidth value={selectedSchedule?.source || ''}
                  onChange={(e) => setSelectedSchedule({ ...selectedSchedule, source: e.target.value })}
                />
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>취소</Button>
        <Button variant="contained" onClick={onUpdate}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}