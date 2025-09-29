import React from 'react';
import { Autocomplete, TextField } from '@mui/material';
import CourtSelection from './CourtSelection'; // 장소 선택 UI import
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';

export default function StandardFields({ form, setForm, isGame, sourceList, courts, courtProps }) {
  return (
    <>
      <TextField
        label="날짜"
        type="date"
        fullWidth
        size="small"
        value={form.date || ''}
        onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
        InputLabelProps={{ shrink: true }}
      />
      <TextField
        label="시간 (예: 13:00~15:00)"
        fullWidth
        size="small"
        value={form.time}
        onChange={(e) => setForm({ ...form, time: handleTimeInputChange(e.target.value) })}
      />
      <CourtSelection courts={courts} {...courtProps} />
      <TextField
        label="비용"
        fullWidth
        size="small"
        type="number"
        value={form.price || ''}
        onChange={(e) => setForm({ ...form, price: handleNumericInputChange(e.target.value) })}
      />
      {isGame && (
        <Autocomplete
          options={sourceList || []}
          value={form.source || ''}
          onChange={(e, newValue) => setForm({ ...form, source: newValue })}
          onInputChange={(e, newInputValue) => setForm({ ...form, source: newInputValue })}
          renderInput={(params) => <TextField {...params} label="소스" fullWidth />}
          freeSolo
          size="small"
        />
      )}
    </>
  );
}