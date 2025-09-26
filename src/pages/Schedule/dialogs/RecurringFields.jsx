import React from 'react';
import { Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import CourtSelection from './CourtSelection'; 
import { handleNumericInputChange, handleTimeInputChange } from '../../../utils/handleInput';

const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

export default function RecurringFields({ recurringOptions, setRecurringOptions, courts, courtProps }) {
  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="primary">반복 설정</Typography>
      <TextField
        select
        size="small"
        label="반복 주기"
        value={recurringOptions.frequency}
        onChange={(e) => setRecurringOptions({ ...recurringOptions, frequency: Number(e.target.value) })}
      >
        <MenuItem value={1}>주 1회</MenuItem>
        <MenuItem value={2}>주 2회</MenuItem>
      </TextField>
      <Grid container spacing={1}>
        <Grid item xs={4} sx={{ maxWidth: 70 }}>
          <TextField
            select
            label="요일 1"
            fullWidth
            size="small"
            value={recurringOptions.day1}
            onChange={(e) => setRecurringOptions({ ...recurringOptions, day1: e.target.value })}
          >
            {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
          </TextField>
        </Grid>
        <Grid item xs={8} sx={{ maxWidth: 170 }}>
          <TextField
            label="시간 1"
            value={recurringOptions.time1}
            fullWidth
            size="small"
            onChange={(e) => setRecurringOptions({ ...recurringOptions, time1: handleTimeInputChange(e.target.value) })}
          />
        </Grid>
      </Grid>
      {recurringOptions.frequency === 2 && (
        <Grid container spacing={1}>
          <Grid item xs={4} sx={{ maxWidth: 70 }}>
            <TextField
              select
              label="요일 2"
              fullWidth
              size="small"
              value={recurringOptions.day2}
              onChange={(e) => setRecurringOptions({ ...recurringOptions, day2: e.target.value })}
            >
              {weekDays.map(day => <MenuItem key={day} value={day}>{day}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={8} sx={{ maxWidth: 170 }}>
            <TextField
              label="시간 2"
              fullWidth
              size="small"
              value={recurringOptions.time2}
              onChange={(e) => setRecurringOptions({ ...recurringOptions, time2: handleTimeInputChange(e.target.value) })}
            />
          </Grid>
        </Grid>
      )}
      <CourtSelection courts={courts} {...courtProps} />
      <TextField
        label="월 비용"
        type="number"
        fullWidth
        size="small"
        value={recurringOptions.monthlyPrice}
        onChange={(e) => setRecurringOptions({ ...recurringOptions, monthlyPrice: handleNumericInputChange(e.target.value) })}
      />
      <TextField
        label="종료일"
        type="date"
        fullWidth
        size="small"
        value={recurringOptions.endDate}
        onChange={(e) => setRecurringOptions({ ...recurringOptions, endDate: e.target.value })}
        InputLabelProps={{ shrink: true }}
      />
    </Stack>
  );
}