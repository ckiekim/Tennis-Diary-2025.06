import { Avatar, Box, IconButton, Popover, Typography } from '@mui/material';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';

const ClubMemberList = ({
  members, isOwner, user, anchorEl, selectedMember,
  onMemberClick, onPopoverClose, onInviteClick, onKickClick,
}) => {
  const openPopover = Boolean(anchorEl);
  
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography fontSize="13" fontWeight="bold">멤버 목록</Typography>
        {isOwner && (
          <IconButton size="small" onClick={onInviteClick} title="멤버 추가">
            <GroupAddIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: 4 }}>
        {members.map(member => (
          <IconButton key={member.id} onClick={(e) => onMemberClick(e, member)} sx={{ p: 0 }}>
            <Avatar src={member.photoUrl || ''} alt={member.username} sx={{ width: 36, height: 36 }} />
          </IconButton>
        ))}
      </Box>
      <Popover open={openPopover} anchorEl={anchorEl} onClose={onPopoverClose} /* ... */>
        {selectedMember && (
          <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedMember.photoUrl || ''} alt={selectedMember.username} sx={{ width: 52, height: 52 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">{selectedMember.username}</Typography>
              <Typography variant="caption" color="text.secondary">
                {selectedMember.role === 'owner' ? '클럽장' : '멤버'}
              </Typography>
            </Box>
            {isOwner && user.uid !== selectedMember.id && (
              <IconButton size="small" onClick={() => onKickClick(selectedMember)} title="강퇴">
                <PersonRemoveIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        )}
      </Popover>
    </>
  );
};
export default ClubMemberList;