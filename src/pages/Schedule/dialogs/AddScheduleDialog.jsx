import React, { useEffect, useState, useMemo } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormGroup, FormControlLabel, MenuItem, Stack, Switch, TextField 
} from '@mui/material';
import useSourceList from '../../../hooks/useSourceList';
import TournamentFields from './TournamentFields';
import RecurringFields from './RecurringFields';
import StandardFields from './StandardFields';

export default function AddScheduleDialog({
  courts, open, form, setOpen, setForm, onAddSchedule, onAddRecurringSchedule, isClubSchedule = false
}) {
  const sourceList = useSourceList();
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringOptions, setRecurringOptions] = useState({
    frequency: 1, // 1: 주 1회, 2: 주 2회
    day1: '월', time1: '10:00~10:20',
    day2: '수', time2: '10:00~10:20',
    monthlyPrice: '', endDate: '',
  });
  const [selectedCourt, setSelectedCourt] = useState(null); // 선택된 코트 객체
  const [courtType, setCourtType] = useState(''); // 선택된 코트 타입 (예: "실내")

  const isJeongmo = useMemo(() => form?.type === "정모", [form?.type]);
  const isLesson = useMemo(() => form?.type === "레슨", [form?.type]);
  const isTournament = useMemo(() => form?.type === "대회", [form?.type]);
  const isGame = useMemo(() => form?.type === "게임", [form?.type]);
  
  const handleTypeChange = (e) => {
    const newType = e.target.value;

    // 날짜 등 유지하고 싶은 공통 값은 보존합니다.
    const commonData = {
      date: form.date,
      club: isClubSchedule ? form.club : null,
    };

    // 새로운 종류에 맞는 깨끗한 form 상태를 만듭니다.
    const newForm = {
      ...commonData, // 공통 값 유지
      type: newType,
      name: '', time: '', place: '', placeSelection: null, price: '',
      source: '', 
      // category: '', partner: '', organizer: '', division: '',
    };

    setForm(newForm);

    // 다이얼로그의 다른 상태들도 함께 초기화합니다.
    setSelectedCourt(null);
    setCourtType('');
    setIsRecurring(false);
  };

  useEffect(() => {
    if (selectedCourt) {
      setForm(prev => ({
        ...prev,
        // useScheduleManager에서 사용할 수 있도록 선택 정보를 저장
        placeSelection: { court: selectedCourt, type: courtType },
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
    } else if (!open) {
      setSelectedCourt(null);
      setCourtType('');
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

  const handleCourtChange = (event, newValue) => {
    const courtObject = typeof newValue === 'string' ? courts.find(c => c.name === newValue) : newValue;
    if (courtObject) {
      setSelectedCourt(courtObject);
      // 코트 상세 정보가 있으면 첫 번째 타입을 기본값으로 설정
      setCourtType(courtObject.details?.[0]?.type || '');
    } else {
      // 사용자가 리스트에 없는 코트 이름을 직접 입력한 경우
      setSelectedCourt(null);
      setCourtType('');
      setForm(prev => ({ ...prev, place: newValue, placeSelection: null }));
    }
  };
  
  const handleCourtTypeChange = (event, newType) => {
    if (newType !== null) {
      setCourtType(newType);
    }
  };

  const courtProps = {
    selectedCourt, courtType,
    place: form.place,
    onCourtChange: handleCourtChange,
    onCourtTypeChange: handleCourtTypeChange,
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <DialogTitle>일정 추가</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="종류" select fullWidth size="small" value={form.type}
            onChange={handleTypeChange}
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
            <RecurringFields 
              recurringOptions={recurringOptions} 
              setRecurringOptions={setRecurringOptions} 
              courts={courts} 
              courtProps={courtProps} 
            />
          ) : isTournament ? (
            <TournamentFields 
              form={form} 
              setForm={setForm} 
              courts={courts} 
              courtProps={courtProps} 
            />
          ) : (
            <StandardFields 
              form={form} 
              setForm={setForm} 
              isGame={isGame} 
              sourceList={sourceList} 
              courts={courts} 
              courtProps={courtProps} 
            />
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