import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, TextField } from '@mui/material';
import useSourceList from '../../../hooks/useSourceList';

export default function AddScheduleDialog({courts, open, form, setOpen, setForm, onAddSchedule}) {
  const isStringReplace = form.type === "스트링 교체";
  const isLesson = form.type === "레슨";
  const sourceList = useSourceList();

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
            <MenuItem value="스트링 교체">스트링 교체</MenuItem>
          </TextField>
          { isStringReplace ? (
            <>
              <TextField
                label="스트링" fullWidth value={form.string || ''}
                onChange={(e) => setForm({ ...form, string: e.target.value })}
              />
              <TextField
                label="텐션" fullWidth value={form.tension || ''}
                onChange={(e) => setForm({ ...form, tension: e.target.value })}
              />
              <TextField
                label="교체 장소" fullWidth value={form.place || ''}
                onChange={(e) => setForm({ ...form, place: e.target.value })}
              />
              <TextField
                label="비용" fullWidth type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </>
          ) : (
            <>
              <TextField
                label="시간 (예: 10:00~13:00)" fullWidth value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <Autocomplete
                options={courts.map(c => c.name)}
                value={form.place || ''}
                onChange={(e, newValue) => setForm({ ...form, place: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="장소" fullWidth />
                )}
                freeSolo // 입력값이 courts 목록에 없을 경우도 허용 (선택사항)
              />
              {isLesson ? (
                <TextField
                  label="비용" fullWidth type="number" value={form.price || ''}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              ) : (
                <Autocomplete
                  freeSolo
                  options={sourceList}
                  value={form.source || ''}
                  onChange={(e, newValue) => setForm({ ...form, source: newValue })}
                  onInputChange={(e, newInputValue) => setForm({ ...form, source: newInputValue })}
                  renderInput={(params) => (
                    <TextField {...params} label="소스" fullWidth />
                  )}
                />
              )}
            </>
          ) }
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