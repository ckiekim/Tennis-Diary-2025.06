import React from 'react';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import AddScheduleDialog from '../dialogs/AddScheduleDialog';
import EditScheduleDialog from '../dialogs/EditScheduleDialog';
import DeleteConfirmDialog from '../../../components/DeleteConfirmDialog';
import ResultDialog from '../dialogs/ResultDialog';
import AlertDialog from '../../../components/AlertDialog';

const ScheduleDialogs = ({ manager, courts, user, refresh }) => {
  const handleDialogClose = (setter) => () => {
    setter(false);
    refresh();
  };

  return (
    <>
      <AddScheduleDialog 
        courts={courts}
        open={manager.addOpen}
        form={manager.form}
        setOpen={manager.setAddOpen}
        setForm={manager.setForm}
        onAddSchedule={(form) => manager.handleAddSchedule(form).then(handleDialogClose(manager.setAddOpen))}
        onAddRecurringSchedule={(options, form) => manager.handleAddRecurringSchedule(options, form).then(handleDialogClose(manager.setAddOpen))}
      />

      <EditScheduleDialog 
        courts={courts}
        open={manager.editOpen}
        selectedSchedule={manager.selectedSchedule}
        setOpen={manager.setEditOpen}
        setSelectedSchedule={manager.setSelectedSchedule}
        onUpdate={() => manager.handleUpdate().then(handleDialogClose(manager.setEditOpen))}
      />

      <DeleteConfirmDialog 
        open={manager.deleteOpen}
        onClose={() => manager.setDeleteOpen(false)}
        onConfirm={() => manager.handleDeleteConfirm().then(handleDialogClose(manager.setDeleteOpen))}
      >
        "{manager.selectedSchedule?.date} {manager.selectedSchedule?.type}" 일정을 삭제하시겠습니까? 
        {manager.selectedSchedule?.isRecurring && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <FormControlLabel
              control={<Checkbox checked={manager.deleteAllRecurring} onChange={(e) => manager.setDeleteAllRecurring(e.target.checked)} />}
              label="이 반복 일정 전체를 삭제합니다. 단 결과가 입력된 일정은 삭제되지 않습니다."
            />
          </Box>
        )}
      </DeleteConfirmDialog>

      <ResultDialog 
        open={manager.resultOpen}
        target={manager.resultTarget}
        setOpen={manager.setResultOpen}
        onResult={manager.handleResult}
        uid={user?.uid}
      />

      <AlertDialog 
        open={manager.isAlertOpen}
        onClose={() => manager.setIsAlertOpen(false)}
      >
        {manager.alertMessage}
      </AlertDialog>
    </>
  );
};

export default ScheduleDialogs;