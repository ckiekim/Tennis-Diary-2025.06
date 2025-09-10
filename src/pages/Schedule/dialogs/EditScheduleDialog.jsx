import { Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';
import { tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions } from '../../../data/tournamentConstants';

export default function EditScheduleDialog({
  courts, open, selectedSchedule, setOpen, setSelectedSchedule, onUpdate, isClubSchedule = false
}) {
  if (!selectedSchedule) return null;

  const isJeongmo = selectedSchedule.type === "정모";
  const isTournament = selectedSchedule.type === "대회";
  const isGame = selectedSchedule.type === "게임";

  // 주관 변경 시 참가부문 초기화
  const handleOrganizerChange = (e) => {
    setSelectedSchedule({
      ...selectedSchedule,
      organizer: e.target.value,
      division: '', // 주관 변경 시 참가부문 초기화
    });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth size="small" value={selectedSchedule?.type || ''}
            onChange={(e) => setSelectedSchedule({ ...selectedSchedule, type: e.target.value })}
            disabled={isClubSchedule}
          >
            <MenuItem value="레슨">레슨</MenuItem>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="대회">대회</MenuItem>
            <MenuItem value="정모">정모</MenuItem>
          </TextField>
          {isTournament ? (
            <Stack spacing={2}>
              <TextField label="대회명" fullWidth size="small" value={selectedSchedule.name || ''} onChange={(e) => setSelectedSchedule({ ...selectedSchedule, name: e.target.value })} />
              <Autocomplete
                options={courts.map(c => c.name)} value={selectedSchedule.place || ''}
                onChange={(e, newValue) => setSelectedSchedule({ ...selectedSchedule, place: newValue })}
                renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
                freeSolo size="small"
              />
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField 
                    label="참가종목" select fullWidth size="small" value={selectedSchedule.category || ''} 
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, category: e.target.value })}
                  >
                    {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: 120 }}>
                  <TextField 
                    label="파트너" fullWidth size="small" value={selectedSchedule.partner || ''} 
                    onChange={(e) => setSelectedSchedule({ ...selectedSchedule, partner: e.target.value })} 
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField 
                    label="주관" select fullWidth size="small" value={selectedSchedule.organizer || ''} 
                    onChange={handleOrganizerChange}
                  >
                    {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
                  </TextField>
                </Grid>
                {selectedSchedule.organizer && (
                  <Grid item xs={6} sx={{ minWidth: 120 }}>
                    <TextField 
                      label="참가부문" select fullWidth size="small" value={selectedSchedule.division || ''} 
                      onChange={(e) => setSelectedSchedule({ ...selectedSchedule, division: e.target.value })}
                    >
                      {(selectedSchedule.organizer === 'KATA' ? kataDivisions : katoDivisions).map(div => <MenuItem key={div} value={div}>{div}</MenuItem>)}
                    </TextField>
                  </Grid>
                )}
              </Grid>
              <TextField 
                label="참가비" fullWidth size="small" type="number" value={selectedSchedule.price || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, price: handleNumericInputChange(e.target.value) })}
              />
            </Stack>
          ) : (
            <>
              {isJeongmo && (
                <TextField 
                  label="정모 이름" fullWidth size="small" 
                  value={selectedSchedule.club?.name || selectedSchedule.club || ''}
                  onChange={(e) => setSelectedSchedule({...selectedSchedule, club: e.target.value})}
                  disabled={isClubSchedule}
                />
              )}
              <TextField
                label="시간" fullWidth size="small" value={selectedSchedule?.time || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, time: handleTimeInputChange(e.target.value) })}
              />
              <TextField
                label="장소" select fullWidth size="small" value={selectedSchedule?.place || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, place: e.target.value })}
              >
                {courts.map((court) => (
                  <MenuItem key={court.id} value={court.name}>
                    {court.name} ({court.surface})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="비용" fullWidth size="small" type="number" value={selectedSchedule.price || ''}
                onChange={(e) => setSelectedSchedule({ ...selectedSchedule, price: handleNumericInputChange(e.target.value) })}
              />
             {isGame && (
                <TextField
                  label="소스" fullWidth size="small" value={selectedSchedule?.source || ''}
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