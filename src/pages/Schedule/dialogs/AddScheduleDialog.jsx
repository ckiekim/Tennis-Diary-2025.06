import React, { useEffect, useState } from 'react';
import { 
  Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormGroup, FormControlLabel, Grid, MenuItem, Stack, Switch, TextField, Typography 
} from '@mui/material';
import useSourceList from '../../../hooks/useSourceList';
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';
import { tournamentCategories, tournamentOrganizers, kataDivisions, katoDivisions } from '../../../data/tournamentConstants';

const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
const weekDaysKorMap = ['일', '월', '화', '수', '목', '금', '토'];

export default function AddScheduleDialog({courts, open, form, setOpen, setForm, selectedDate, onAddSchedule, onAddRecurringSchedule}) {
  const isStringReplace = form.type === "스트링 교체";
  const isLesson = form.type === "레슨";
  const isTournament = form.type === "대회";
  const isGame = form.type === "게임";
  const sourceList = useSourceList();

  // 반복 일정 입력을 위한 State 추가
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

  useEffect(() => {
    // 다이얼로그가 열리고, selectedDate 값이 있을 때
    if (open && selectedDate) {
      const dayOfWeekIndex = selectedDate.day();  // 일요일=0, 월요일=1 ... 토요일=6을 반환
      const selectedDay = weekDaysKorMap[dayOfWeekIndex];
      // 반복 옵션의 첫 번째 요일(day1)을 선택된 요일로 업데이트
      setRecurringOptions(prevOptions => ({
        ...prevOptions,
        day1: selectedDay,
      }));
    }
  }, [open, selectedDate]);

  // 다이얼로그가 닫힐 때 모든 상태 초기화
  const handleClose = () => {
    setOpen(false);
    setIsRecurring(false); // 반복 스위치 초기화
    // form과 recurringOptions 초기화는 부모 컴포넌트에서 관리하는 것이 더 좋을 수 있습니다.
  };

  // 저장 버튼 클릭 시 단일/반복에 따라 다른 함수 호출
  const handleSave = () => {
    if (isLesson && isRecurring) {
      // 부모 컴포넌트에 반복 옵션 전달
      onAddRecurringSchedule(recurringOptions);
    } else {
      // 기존 단일 일정 추가 함수 호출
      onAddSchedule();
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

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
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
          
          {isLesson && (
            <FormGroup>
              <FormControlLabel
                control={<Switch checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} />}
                label="반복 일정"
              />
            </FormGroup>
          )}

          { isStringReplace ? (
            <>
              <TextField label="스트링" fullWidth value={form.string || ''} onChange={(e) => setForm({ ...form, string: e.target.value })} />
              <TextField label="텐션" fullWidth value={form.tension || ''} onChange={(e) => setForm({ ...form, tension: e.target.value })} />
              <TextField label="교체 장소" fullWidth value={form.place || ''} onChange={(e) => setForm({ ...form, place: e.target.value })} />
              <TextField label="비용" fullWidth type="number" value={form.price || ''} 
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })} 
              />
            </>
          ) : isLesson && isRecurring ? (
            // 레슨 && 반복 일정 UI
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="primary">반복 설정</Typography>
              <TextField select label="반복 주기" value={recurringOptions.frequency}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, frequency: Number(e.target.value) })}
              >
                <MenuItem value={1}>주 1회</MenuItem>
                <MenuItem value={2}>주 2회</MenuItem>
              </TextField>
              <Grid container spacing={1}>
                <Grid item xs={4} sx={{maxWidth: 70}}>
                  <TextField select label="요일 1" fullWidth value={recurringOptions.day1} onChange={(e) => setRecurringOptions({...recurringOptions, day1: e.target.value})}>
                    {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={8} sx={{maxWidth: 170}}>
                  <TextField label="시간 1" value={recurringOptions.time1} fullWidth
                    onChange={(e) => setRecurringOptions({ ...recurringOptions, time1: handleTimeInputChange(e.target.value) })}
                  />
                </Grid>
              </Grid>
              {recurringOptions.frequency === 2 && (
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField select label="요일 2" fullWidth value={recurringOptions.day2} onChange={(e) => setRecurringOptions({...recurringOptions, day2: e.target.value})}>
                      {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={8} sx={{maxWidth: 170}}>
                    <TextField label="시간 2" fullWidth value={recurringOptions.time2} 
                      onChange={(e) => setRecurringOptions({ ...recurringOptions, time2: handleTimeInputChange(e.target.value) })} 
                    />
                  </Grid>
                </Grid>
              )}
              <Autocomplete
                options={courts.map(c => c.name)}
                value={form.place || ''}
                onChange={(e, newValue) => setForm({ ...form, place: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="장소" fullWidth />
                )}
                freeSolo // 입력값이 courts 목록에 없을 경우도 허용 (선택사항)
              />
              <TextField
                label="월 비용" type="number" fullWidth
                value={recurringOptions.monthlyPrice}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, monthlyPrice: handleNumericInputChange(e.target.value) })}
              />
              <TextField
                label="종료일" type="date" fullWidth
                value={recurringOptions.endDate}
                onChange={(e) => setRecurringOptions({ ...recurringOptions, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          ) : isTournament ? (
            <Stack spacing={2}>
              <TextField label="대회명" fullWidth value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              {/* <TextField label="일자" type="date" fullWidth value={form.date || ''} onChange={(e) => setForm({ ...form, date: e.target.value })} InputLabelProps={{ shrink: true }} /> */}
              <Autocomplete
                options={courts.map(c => c.name)}
                value={form.place || ''}
                onChange={(e, newValue) => setForm({ ...form, place: newValue })}
                renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
                freeSolo
              />
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField label="참가종목" select fullWidth value={form.category || ''} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                    {tournamentCategories.map(cat => <MenuItem key={cat} value={cat}>{cat}</MenuItem>)}
                  </TextField>
                </Grid>
                <Grid item xs={6} sx={{ maxWidth: 120 }}>
                  <TextField label="파트너" fullWidth value={form.partner || ''} onChange={(e) => setForm({ ...form, partner: e.target.value })} />
                </Grid>
              </Grid>
              <Grid container spacing={2}>
                <Grid item xs={6} sx={{ minWidth: 100 }}>
                  <TextField label="주관" select fullWidth value={form.organizer || ''} onChange={handleOrganizerChange}>
                    {tournamentOrganizers.map(org => <MenuItem key={org} value={org}>{org}</MenuItem>)}
                  </TextField>
                </Grid>
                {form.organizer && (
                  <Grid item xs={6} sx={{ minWidth: 120 }}>
                    <TextField label="참가부문" select fullWidth value={form.division || ''} onChange={(e) => setForm({ ...form, division: e.target.value })}>
                      {(form.organizer === 'KATA' ? kataDivisions : katoDivisions).map(div => <MenuItem key={div} value={div}>{div}</MenuItem>)}
                    </TextField>
                  </Grid>
                )}
              </Grid>
              <TextField label="참가비" fullWidth type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
            </Stack>
          ) : (
            <>
              {(isGame || (isLesson && !isRecurring)) && (
                <TextField label="시간 (예: 13:00~15:00)" fullWidth value={form.time} 
                  onChange={(e) => setForm({ ...form, time: handleTimeInputChange(e.target.value) })}
                />
              )}
              <Autocomplete
                options={courts.map(c => c.name)}
                value={form.place || ''}
                onChange={(e, newValue) => setForm({ ...form, place: newValue })}
                renderInput={(params) => (
                  <TextField {...params} label="장소" fullWidth />
                )}
                freeSolo // 입력값이 courts 목록에 없을 경우도 허용 (선택사항)
              />
              <TextField
                label="비용" fullWidth type="number" value={form.price || ''}
                onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
              />
              {isGame && (
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
        <Button onClick={handleClose}>취소</Button>
        <Button onClick={handleSave} variant="contained" color="primary">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
}

