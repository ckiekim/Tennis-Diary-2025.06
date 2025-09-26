import { useEffect, useMemo, useState } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, FormGroup, FormControlLabel, MenuItem, Stack, Switch, TextField 
} from '@mui/material';
import TournamentFields from './TournamentFields';
import RecurringFields from './RecurringFields';
import StandardFields from './StandardFields';

export default function EditScheduleDialog({
  courts, open, selectedSchedule, setOpen, onUpdate, isClubSchedule = false, recurringEditInfo
}) {
  const [form, setForm] = useState(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringOptions, setRecurringOptions] = useState({ 
    frequency: 1, day1: '월', time1: '', day2: '수', time2: '', monthlyPrice: '', endDate: '' 
  });
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [courtType, setCourtType] = useState('');

  useEffect(() => {
    if (selectedSchedule) {
      setForm(selectedSchedule); // 폼 상태를 초기 데이터로 설정
      const isRecurringEvent = selectedSchedule.isRecurring || false;
      setIsRecurring(isRecurringEvent);

     if (isRecurringEvent && recurringEditInfo) {
        // 부모로부터 받은 recurringEditInfo로 상태를 설정
        setRecurringOptions({
          monthlyPrice: recurringEditInfo.price,
          endDate: recurringEditInfo.endDate,
          frequency: recurringEditInfo.frequency,
          day1: recurringEditInfo.day1,
          time1: recurringEditInfo.time1,
          day2: recurringEditInfo.day2,
          time2: recurringEditInfo.time2,
        });
      }
      const placeSource = selectedSchedule.placeInfo || { courtName: selectedSchedule.place };
      if (placeSource.courtId) {
        const court = courts.find(c => c.id === placeSource.courtId);
        setSelectedCourt(court || null);
        setCourtType(placeSource.courtType || '');
      } else if (placeSource.courtName) {
        const court = courts.find(c => c.name === placeSource.courtName);
        setSelectedCourt(court || null);
        setCourtType(court?.details?.[0]?.type || '');
      }
    }
  }, [selectedSchedule, courts, recurringEditInfo]);

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
    let finalData = { 
      ...form,
    };
    // 반복 일정인 경우, recurringOptions의 값을 form 데이터에 반영
    if ((isLesson || isJeongmo) && isRecurring) {
      finalData.recurringInfo = {
        price: recurringOptions.monthlyPrice,
        endDate: recurringOptions.endDate,
      };
    }
    onUpdate(finalData);
  };

  const isJeongmo = useMemo(() => form?.type === "정모", [form?.type]);
  const isLesson = useMemo(() => form?.type === "레슨", [form?.type]);
  const isTournament = useMemo(() => form?.type === "대회", [form?.type]);
  const isGame = useMemo(() => form?.type === "게임", [form?.type]);
  
  const courtProps = {
    selectedCourt, courtType,
    place: form?.place,
    onCourtChange: handleCourtChange,
    onCourtTypeChange: handleCourtTypeChange,
  };
  
  if (!form) return null; // form이 설정되기 전에는 아무것도 렌더링하지 않음

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
          {(isLesson || isJeongmo) && (
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
                label="반복 일정"
              />
            </FormGroup>
          )}
          {isTournament ? (
            <TournamentFields 
              form={form} 
              setForm={setForm} 
              courts={courts} 
              courtProps={courtProps} 
            />
          ) : (isLesson || isJeongmo) && isRecurring ? (
            <RecurringFields 
              recurringOptions={recurringOptions} 
              setRecurringOptions={setRecurringOptions} 
              courts={courts} 
              courtProps={courtProps} 
            />
          ) : (
            <StandardFields 
              form={form} 
              setForm={setForm} 
              isGame={isGame} 
              courts={courts} 
              courtProps={courtProps} 
            />
          )}

          {isJeongmo && (
            <TextField 
              label="정모 이름" fullWidth size="small" 
              value={form.club?.name || form.club || ''}
              onChange={(e) => setForm({...form, club: e.target.value})}
              disabled={isClubSchedule}
            />
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