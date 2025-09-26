import React from 'react';
import { Autocomplete, TextField, ToggleButtonGroup, ToggleButton } from '@mui/material';

export default function CourtSelection({
  courts,
  selectedCourt,
  courtType,
  place, // 사용자가 직접 입력한 장소 이름
  onCourtChange,
  onCourtTypeChange,
}) {
  return (
    <>
      <Autocomplete
        options={courts}
        getOptionLabel={(option) => option.name || option}
        value={selectedCourt || place || ''}
        onChange={onCourtChange}
        onInputChange={(event, newInputValue, reason) => {
          if (reason === 'input') {
            onCourtChange(event, newInputValue);
          }
        }}
        renderInput={(params) => <TextField {...params} label="장소" fullWidth />}
        freeSolo size="small"
      />
      {selectedCourt?.details && selectedCourt.details.length > 1 && (
        <ToggleButtonGroup
          color="primary"
          value={courtType}
          exclusive
          onChange={onCourtTypeChange}
          fullWidth size="small"
        >
          {selectedCourt.details.map((detail) => (
            <ToggleButton key={detail.type} value={detail.type}>
              {detail.type} ({detail.surface})
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      )}
    </>
  );
}