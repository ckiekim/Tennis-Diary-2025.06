import { useEffect, useState } from 'react';
import { 
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, MenuItem, 
  Stack, TextField, ToggleButtonGroup, ToggleButton 
} from '@mui/material';
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';
import { 
  tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions, ktaDivisions, dxoDivisions, wemixDivisions
} from '../../../data/tournamentConstants';

export default function EditScheduleDialog({
  courts, open, selectedSchedule, setOpen, onUpdate, isClubSchedule = false
}) {
  const [form, setForm] = useState(null);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtType, setCourtType] = useState('');

  useEffect(() => {
    if (selectedSchedule) {
      setForm(selectedSchedule); // 폼 상태를 초기 데이터로 설정

      const { place, placeInfo } = selectedSchedule;
      if (placeInfo) {
        const court = courts.find(c => c.id === placeInfo.courtId);
        setSelectedCourt(court || null);
        setCourtType(placeInfo.courtType || '');
      } else if (place) { // 하위 호환성을 위한 폴백
        const court = courts.find(c => c.name === place);
        setSelectedCourt(court || null);
        setCourtType(court?.details?.[0]?.type || '');
      }
    }
  }, [selectedSchedule, courts]);

  if (!form) return null; // form이 설정되기 전에는 아무것도 렌더링하지 않음

  const handleCourtChange = (event, newValue) => {
    const courtObject = typeof newValue === 'string' 
      ? courts.find(c => c.name === newValue) 
      : newValue;
    
    if (courtObject) {
      const newCourtType = courtObject.details?.[0]?.type || '';
      setSelectedCourt(courtObject);
      setCourtType(newCourtType);
      setForm(prev => ({
        ...prev,
        place: courtObject.name,
        placeSelection: { court: courtObject, type: newCourtType }
      }));
    } else {
      setSelectedCourt(null);
      setCourtType('');
      setForm(prev => ({ ...prev, place: newValue, placeSelection: null }));
    }
  };

  const handleCourtTypeChange = (event, newType) => {
    if (newType !== null) {
      setCourtType(newType);
      setForm(prev => ({
        ...prev,
        placeSelection: {
          // court 정보가 날아가지 않도록 안전하게 업데이트
          court: prev.placeSelection?.court || selectedCourt,
          type: newType
        }
      }));
    }
  };

  const handleConfirmUpdate = () => {
    onUpdate(form);
  };

  const isJeongmo = form.type === "정모";
  const isTournament = form.type === "대회";
  const isGame = form.type === "게임";

  const handleOrganizerChange = (e) => {
    setForm({ ...form, organizer: e.target.value, division: '' });
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
      <DialogTitle>일정 수정</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth size="small" value={form?.type || ''}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={isClubSchedule}
          >
            <MenuItem value="레슨">레슨</MenuItem>
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="대회">대회</MenuItem>
            <MenuItem value="정모">정모</MenuItem>
          </TextField>
          {isTournament ? (
            <Stack spacing={2}>
              <TextField label="대회명" fullWidth size="small" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField 
                    label="참가종목" select fullWidth size="small" value={form.category || ''} 
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                  >
                    {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: 120 }}>
                  <TextField 
                    label="파트너" fullWidth size="small" value={form.partner || ''} 
                    onChange={(e) => setForm({ ...form, partner: e.target.value })} 
                  />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField 
                    label="주관" select fullWidth size="small" value={form.organizer || ''} 
                    onChange={handleOrganizerChange}
                  >
                    {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
                  </TextField>
                </Grid>
                {form.organizer && (
                  <Grid item xs={6} sx={{ minWidth: 120 }}>
                    <TextField 
                      label="참가부문" select fullWidth size="small" value={form.division || ''} 
                      onChange={(e) => setForm({ ...form, division: e.target.value })}
                    >
                      {(
                        form.organizer === 'KATA' ? kataDivisions :
                        form.organizer === 'KATO' ? katoDivisions :
                        form.organizer === 'KTA' ? ktaDivisions :
                        form.organizer === '던롭 X-OPEN' ? dxoDivisions :
                        form.organizer === 'WEMIX' ? wemixDivisions :
                        [] // 해당하는 주관사가 없을 경우 빈 배열 반환
                      ).map(div => <MenuItem key={div} value={div}>{div}</MenuItem>)}
                    </TextField>
                  </Grid>
                )}
              </Grid>
              <TextField 
                label="참가비" fullWidth size="small" type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
            </Stack>
          ) : (
            <>
              {isJeongmo && (
                <TextField 
                  label="정모 이름" fullWidth size="small" 
                  value={form.club?.name || form.club || ''}
                  onChange={(e) => setForm({...form, club: e.target.value})}
                  disabled={isClubSchedule}
                />
              )}
              <TextField
                label="시간" fullWidth size="small" value={form?.time || ''}
                onChange={(e) => setForm({ ...form, time: handleTimeInputChange(e.target.value) })}
              />
              <TextField
                label="비용" fullWidth size="small" type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
             {isGame && (
                <TextField
                  label="소스" fullWidth size="small" value={form?.source || ''}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                />
              )}
            </>
          )}

          {/* 공통 장소 선택 UI */}
          <Autocomplete
            options={courts}
            getOptionLabel={(option) => option.name || ''}
            value={selectedCourt || form.place || ''}
            onChange={handleCourtChange}
            onInputChange={(event, newInputValue, reason) => {
              if (reason === 'input') handleCourtChange(event, newInputValue);
            }}
            renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
            freeSolo size="small"
          />
          {selectedCourt?.details && selectedCourt.details.length > 1 && (
            <ToggleButtonGroup
              color="primary" value={courtType} exclusive
              onChange={handleCourtTypeChange} aria-label="Court Type"
              fullWidth size="small"
            >
              {selectedCourt.details.map((detail) => (
                <ToggleButton key={detail.type} value={detail.type}>
                  {detail.type} ({detail.surface})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>취소</Button>
        <Button variant="contained" onClick={handleConfirmUpdate}>
          수정
        </Button>
      </DialogActions>
    </Dialog>
  );
}