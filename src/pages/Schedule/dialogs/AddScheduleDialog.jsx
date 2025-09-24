import React, { useEffect, useState, useMemo } from 'react';
import { 
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormGroup, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, ToggleButtonGroup, ToggleButton, Typography 
} from '@mui/material';
import useSourceList from '../../../hooks/useSourceList';
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';
import { 
  tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions, ktaDivisions, dxoDivisions, wemixDivisions
} from '../../../data/tournamentConstants';

const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

export default function AddScheduleDialog({
  courts, open, form, setOpen, setForm, onAddSchedule, onAddRecurringSchedule, isClubSchedule = false
}) {
  const sourceList = useSourceList();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringOptions, setRecurringOptions] = useState({
    frequency: 1, // 1: 주 1회, 2: 주 2회
    day1: '월',
    time1: '10:00~10:20',
    day2: '수',
    time2: '10:00~10:20',
    monthlyPrice: '',
    endDate: '',
  });
  const [selectedCourt, setSelectedCourt] = useState(null); // 선택된 코트 객체
  const [courtType, setCourtType] = useState(''); // 선택된 코트 타입 (예: "실내")

  const isJeongmo = useMemo(() => form?.type === "정모", [form?.type]);
  const isLesson = useMemo(() => form?.type === "레슨", [form?.type]);
  const isTournament = useMemo(() => form?.type === "대회", [form?.type]);
  const isGame = useMemo(() => form?.type === "게임", [form?.type]);

  useEffect(() => {
    if (isJeongmo && isRecurring) {
      setRecurringOptions(prev => ({
        ...prev,
        time1: '09:00~12:00',
        time2: '09:00~12:00'
      }));
    }
  }, [isJeongmo, isRecurring]);

  useEffect(() => {
    if (selectedCourt) {
      setForm(prev => ({
        ...prev,
        // useScheduleManager에서 사용할 수 있도록 선택 정보를 저장
        placeSelection: {
          court: selectedCourt,
          type: courtType,
        },
        // 사용자가 직접 입력하는 경우를 위해 place 필드도 유지
        place: selectedCourt.name,
      }));
    }
  }, [selectedCourt, courtType, setForm]);

  // 다이얼로그가 열릴 때, form에 기존 데이터가 있으면 상태 복원
  useEffect(() => {
    if (open && form?.placeSelection?.court) {
      setSelectedCourt(form.placeSelection.court);
      setCourtType(form.placeSelection.type);
    }
  }, [open, form]);

  if (!form) {
    return null;
  }

  // 다이얼로그가 닫힐 때 모든 상태 초기화
  const handleClose = () => {
    setOpen(false);
    setIsRecurring(false); // 반복 스위치 초기화
  };

  // 저장 버튼 클릭 시 단일/반복에 따라 다른 함수 호출
  const handleSave = () => {
    if ((isLesson || isJeongmo) && isRecurring) {
      onAddRecurringSchedule(recurringOptions, form);
    } else {
      onAddSchedule(form);
    }
  };

  // 주관 변경 시 참가부문 초기화
  const handleOrganizerChange = (e) => {
    setForm({
      ...form,
      organizer: e.target.value,
      division: '', // 주관 변경 시 참가부문 초기화
    });
  };

  // Autocomplete에서 코트를 선택했을 때 호출
  const handleCourtChange = (event, newValue) => {
    const courtObject = typeof newValue === 'string' ? courts.find(c => c.name === newValue) : newValue;
    
    if (courtObject) {
      setSelectedCourt(courtObject);
      // 코트 상세 정보가 있으면 첫 번째 타입을 기본값으로 설정
      if (courtObject.details && courtObject.details.length > 0) {
        setCourtType(courtObject.details[0].type);
      } else {
        setCourtType('');
      }
    } else {
      // 사용자가 리스트에 없는 코트 이름을 직접 입력한 경우
      setSelectedCourt(null);
      setCourtType('');
      setForm(prev => ({ ...prev, place: newValue, placeSelection: null }));
    }
  };
  
  // 실내/실외 토글 버튼 핸들러
  const handleCourtTypeChange = (event, newType) => {
    if (newType !== null) {
      setCourtType(newType);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>일정 추가</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth size="small" value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            disabled={isClubSchedule}
          >
            <MenuItem value="게임">게임</MenuItem>
            <MenuItem value="레슨">레슨</MenuItem>
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

          {(isLesson || isJeongmo) && isRecurring ? (
            // 반복 일정 UI
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="primary">반복 설정</Typography>
              <TextField select size="small" label="반복 주기" value={recurringOptions.frequency}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, frequency: Number(e.target.value) })}
              >
                <MenuItem value={1}>주 1회</MenuItem>
                <MenuItem value={2}>주 2회</MenuItem>
              </TextField>
              <Grid container spacing={1}>
                <Grid item xs={4} sx={{maxWidth: 70}}>
                  <TextField select label="요일 1" fullWidth size="small" value={recurringOptions.day1} 
                    onChange={(e) => setRecurringOptions({...recurringOptions, day1: e.target.value})}
                  >
                    {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={8} sx={{maxWidth: 170}}>
                  <TextField label="시간 1" value={recurringOptions.time1} fullWidth size="small"
                    onChange={(e) => setRecurringOptions({ ...recurringOptions, time1: handleTimeInputChange(e.target.value) })}
                  />
                </Grid>
              </Grid>
              {recurringOptions.frequency === 2 && (
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField select label="요일 2" fullWidth size="small" value={recurringOptions.day2} 
                      onChange={(e) => setRecurringOptions({...recurringOptions, day2: e.target.value})}
                    >
                      {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={8} sx={{maxWidth: 170}}>
                    <TextField label="시간 2" fullWidth size="small" value={recurringOptions.time2} 
                      onChange={(e) => setRecurringOptions({ ...recurringOptions, time2: handleTimeInputChange(e.target.value) })} 
                    />
                  </Grid>
                </Grid>
              )}
              {/* 장소 선택 Autocomplete (반복/대회/일반 모든 경우에 적용) */}
              <Autocomplete
                options={courts}
                getOptionLabel={(option) => option.name || option}
                value={selectedCourt || form.place || ''}
                onChange={handleCourtChange}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'input') {
                    handleCourtChange(event, newInputValue);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
                freeSolo size="small"
              />
              {/* 선택된 코트가 실내/실외 옵션을 모두 가질 경우 토글 버튼을 보여줌 */}
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
              <TextField
                label="월 비용" type="number" fullWidth size="small"
                value={recurringOptions.monthlyPrice}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, monthlyPrice: handleNumericInputChange(e.target.value) })}
              />
              <TextField
                label="종료일" type="date" fullWidth size="small"
                value={recurringOptions.endDate}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          ) : isTournament ? (
            <Stack spacing={2}>
              <TextField label="대회명" fullWidth size="small" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <TextField 
                label="날짜" type="date" fullWidth size="small" value={form.date || ''} 
                onChange={(e) => {
                  const newDate = e.target.value;
                  setForm(prevForm => ({ ...prevForm, date: newDate }));  // setForm이 항상 최신 상태(prevForm)를 참조하도록
                }}
                InputLabelProps={{ shrink: true }} 
              />
              {/* 장소 선택 Autocomplete (반복/대회/일반 모든 경우에 적용) */}
              <Autocomplete
                options={courts}
                getOptionLabel={(option) => option.name || option}
                value={selectedCourt || form.place || ''}
                onChange={handleCourtChange}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'input') {
                    handleCourtChange(event, newInputValue);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
                freeSolo size="small"
              />
              {/* 선택된 코트가 실내/실외 옵션을 모두 가질 경우 토글 버튼을 보여줌 */}
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
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField label="참가종목" select fullWidth size="small" value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: 120 }}>
                  <TextField label="파트너" fullWidth size="small" value={form.partner || ''} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField label="주관" select fullWidth size="small" value={form.organizer || ''} onChange={handleOrganizerChange}>
                    {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
                  </TextField>
                </Grid>
                {form.organizer && (
                  <Grid item xs={6} sx={{ minWidth: 120 }}>
                    <TextField label="참가부문" select fullWidth size="small" value={form.division || ''} onChange={(e) => setForm({ ...form, division: e.target.value })}>
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
              <TextField label="참가비" fullWidth size="small" type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
            </Stack>
          ) : (
            <>
              <TextField 
                label="날짜" type="date" fullWidth size="small" value={form.date || ''} 
                onChange={(e) => {
                  const newDate = e.target.value;
                  setForm(prevForm => ({ ...prevForm, date: newDate }));  // setForm이 항상 최신 상태(prevForm)를 참조하도록
                }}
                InputLabelProps={{ shrink: true }} 
              />
              {(isGame || ((isLesson || isJeongmo) && !isRecurring)) && (
                <TextField label="시간 (예: 13:00~15:00)" fullWidth size="small" value={form.time} 
                  onChange={(e) => setForm({ ...form, time: handleTimeInputChange(e.target.value) })}
                />
              )}
              {/* 장소 선택 Autocomplete (반복/대회/일반 모든 경우에 적용) */}
              <Autocomplete
                options={courts}
                getOptionLabel={(option) => option.name || option}
                value={selectedCourt || form.place || ''}
                onChange={handleCourtChange}
                onInputChange={(event, newInputValue, reason) => {
                  if (reason === 'input') {
                    handleCourtChange(event, newInputValue);
                  }
                }}
                renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
                freeSolo size="small"
              />
              {/* 선택된 코트가 실내/실외 옵션을 모두 가질 경우 토글 버튼을 보여줌 */}
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
              <TextField
                label="비용" fullWidth size="small" type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
              {isGame && (
                <Autocomplete
                  options={sourceList} value={form.source || ''}
                  onChange={(e, newValue) => setForm({ ...form, source: newValue })}
                  onInputChange={(e, newInputValue) => setForm({ ...form, source: newInputValue })}
                  renderInput={(params) => (
                    <TextField {...params} label="소스" fullWidth />
                  )}
                  freeSolo size="small"
                />
              )}
            </>
          ) }
          {isJeongmo && (
            <TextField 
              label="정모 이름" fullWidth size="small" value={form.club || ''} 
              onChange={(e) => setForm({ ...form, club: e.target.value })} 
              disabled={isClubSchedule}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

