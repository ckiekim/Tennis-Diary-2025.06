import { Box, Checkbox, FormControlLabel } from '@mui/material';
import EditClubDialog from '../dialogs/EditClubDialog';
import ConfirmDialog from '../../../components/ConfirmDialog';
import InviteMemberDialog from '../dialogs/InviteMemberDialog';
import AddPostDialog from '../dialogs/AddPostDialog';
import AddScheduleDialog from '../../Schedule/dialogs/AddScheduleDialog';
import EditScheduleDialog from '../../Schedule/dialogs/EditScheduleDialog';
import dayjs from 'dayjs';

const ClubDialogs = ({ 
  manager, club, clubId, scheduleForm, setScheduleForm, isMember, isOwner, 
  currentUserProfile, onPostAdded, courts, isClubSchedule 
}) => {
  return (
    <>
      {isOwner && (
        <>
          <EditClubDialog 
            open={manager.editOpen}  onClose={() => manager.setEditOpen(false)}
            onUpdate={manager.handleUpdateClub} clubData={club} clubId={clubId}
          />
          <ConfirmDialog 
            open={manager.deleteOpen} onClose={() => manager.setDeleteOpen(false)}
            onConfirm={manager.handleDeleteClub}
          >
            "{club.name}" 클럽을 정말 삭제하시겠습니까?
          </ConfirmDialog>
          <InviteMemberDialog
            open={manager.inviteOpen} onClose={() => manager.setInviteOpen(false)}
            onInvite={manager.handleInviteMember}
          />
        </>
      )}
      <AddPostDialog 
        open={manager.addPostOpen} onClose={() => manager.setAddPostOpen(false)}
        clubId={clubId} onSuccess={onPostAdded} currentUserProfile={currentUserProfile}
      />
      <ConfirmDialog open={manager.leaveOpen} onClose={() => manager.setLeaveOpen(false)} onConfirm={manager.handleLeaveClub} title="탈퇴">
        "{club.name}" 클럽에서 정말 탈퇴하시겠습니까?
      </ConfirmDialog>
      <ConfirmDialog open={!!manager.kickTarget} onClose={() => manager.setKickTarget(null)} onConfirm={manager.handleKickMember} title="강퇴">
        "{manager.kickTarget?.username}"님을 정말로 강퇴시키겠습니까?
      </ConfirmDialog>
      
      {isMember && (
        <AddScheduleDialog
          courts={courts}
          open={manager.addScheduleOpen}
          form={scheduleForm}
          setOpen={manager.setAddScheduleOpen}
          setForm={setScheduleForm}
          onAddSchedule={(form) => manager.handleAddSchedule(form)}
          onAddRecurringSchedule={(recurringOptions, form) => manager.handleAddRecurringSchedule(recurringOptions, form)}
          isClubSchedule={isClubSchedule}
        />
      )}

      <EditScheduleDialog
        courts={courts}
        open={manager.editScheduleOpen}
        selectedSchedule={manager.selectedSchedule}
        setOpen={manager.setEditScheduleOpen}
        recurringEditInfo={manager.recurringEditInfo}
        // 이제 onUpdate는 payload 객체 하나만 받아서 전달합니다.
        onUpdate={(payload) => manager.handleUpdateSchedule(payload)}
        isClubSchedule={isClubSchedule}
      />

      <ConfirmDialog
        open={manager.deleteScheduleOpen}
        onClose={() => manager.setDeleteScheduleOpen(false)}
        onConfirm={manager.handleDeleteSchedule}
      >
        {manager.selectedSchedule && 
          `"${dayjs(manager.selectedSchedule.date).format('YYYY-MM-DD')} ${manager.selectedSchedule.type}" 일정을 정말 삭제하시겠습니까?`
        }
        {manager.selectedSchedule?.isRecurring && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={manager.deleteAllRecurring}
                  onChange={(e) => manager.setDeleteAllRecurring(e.target.checked)}
                />
              }
              label="이 반복 일정 전체를 삭제합니다."
            />
          </Box>
        )}
      </ConfirmDialog>
    </>
  );
};

export default ClubDialogs;