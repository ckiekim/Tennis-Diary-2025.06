import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, Popover, Stack, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import CreateIcon from '@mui/icons-material/Create';
import dayjs from 'dayjs';

import useAuthState from '../../hooks/useAuthState';
import useSnapshotDocument from '../../hooks/useSnapshotDocument';
import useSnapshotSubcollection from '../../hooks/useSnapshotSubcollection';
import usePaginatedSubcollection from '../../hooks/usePaginatedSubcollection';

import MainLayout from '../../components/MainLayout';
import Posts from './Posts';
import EditClubDialog from './dialogs/EditClubDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import AlertDialog from '../../components/AlertDialog';
import InviteMemberDialog from './dialogs/InviteMemberDialog';
import AddPostDialog from './dialogs/AddPostDialog';
import { collection, doc, increment, setDoc, serverTimestamp, updateDoc, writeBatch } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions  } from '../../api/firebaseConfig';

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);  // 탈퇴
  const [kickTarget, setKickTarget] = useState(null); // 강퇴
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { user, loading: authLoading } = useAuthState();
  const { docData: currentUserProfile, loading: profileLoading } = useSnapshotDocument('users', user?.uid);
  const { docData: club, loading: clubLoading } = useSnapshotDocument('clubs', clubId);
  const { documents: members, loading: membersLoading } = useSnapshotSubcollection(
    `clubs/${clubId}/members`, { orderByField: 'role' }
  );
  const { documents: posts, loading: postsLoading, 
    loadingMore, hasMore, loadMore, refresh: refreshPosts } = usePaginatedSubcollection(
    `clubs/${clubId}/posts`,
    { orderByField: 'createdAt', direction: 'desc', limitCount: 5 }
  );
  const isLoading = authLoading || profileLoading || clubLoading || membersLoading || postsLoading;

  const handleMemberClick = (event, member) => {
    setAnchorEl(event.currentTarget);
    setSelectedMember(member);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
    setSelectedMember(null);
  };

  if (isLoading) {
    return (
      <MainLayout title="로딩 중...">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }  
  if (!club) {
    return (
      <MainLayout title="클럽 정보 없음">
        <Typography sx={{ p: 2 }}>클럽 정보를 찾을 수 없습니다.</Typography>
      </MainLayout>
    );
  }

  const isOwner = user?.uid === club.owner;
  const isMember = user ? members.some(member => member.id === user.uid) : false;

  const handleEditClose = () => {
    setEditOpen(false);
  };

  const handleDelete = async () => {
    if (!isOwner) {
      // alert('클럽장만 삭제할 수 있습니다.');
      setAlertMessage('클럽장만 삭제할 수 있습니다.');
      setIsAlertOpen(true);
      return;
    }
    try {
      const deleteClub = httpsCallable(functions, 'deleteClub');
      await deleteClub({ clubId }); // clubId를 인자로 전달

      setDeleteOpen(false);
      navigate('/clubs'); // 나의 클럽 목록으로 이동
    } catch (err) {
      console.error('클럽 삭제 실패:', err);
      // alert(err.message || '클럽 삭제 중 문제가 발생했습니다.');
      setAlertMessage(err.message || '클럽 삭제 중 문제가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  const handleUpdate = async (clubId, updatedData) => {
  try {
    const clubRef = doc(db, 'clubs', clubId);
    await updateDoc(clubRef, updatedData);    // ✅ 이 코드가 실행되면 서버의 트리거 함수가 자동으로 동작
    // alert('클럽 정보가 성공적으로 수정되었습니다.');
    setAlertMessage('클럽 정보가 성공적으로 수정되었습니다.');
    setIsAlertOpen(true);
    handleEditClose(); // 성공 후 다이얼로그 닫기 및 데이터 새로고침
  } catch (error) {
    console.error("클럽 정보 수정 실패:", error);
    // alert("클럽 정보 수정 중 오류가 발생했습니다.");
    setAlertMessage('클럽 정보 수정 중 오류가 발생했습니다.');
    setIsAlertOpen(true);
  }
};

  const handleInvite = async (invitedUser) => {
    try {
      // clubs/{clubId}/members/{userId} 경로에 'invited' 상태로 문서를 생성
      const memberRef = doc(db, 'clubs', clubId, 'members', invitedUser.uid);
      await setDoc(memberRef, {
        uid: invitedUser.uid, username: invitedUser.nickname, photoUrl: invitedUser.photo,
        role: 'member', status: 'invited', invitedAt: serverTimestamp(),
        clubId: clubId, clubName: club.name,  clubProfileUrl: club.profileUrl,
        region: club.region, ownerName: club.ownerName,
      });
      // alert(`${invitedUser.nickname}님을 초대했습니다.`);
      setAlertMessage(`${invitedUser.nickname}님을 초대했습니다.`);
      setIsAlertOpen(true);
      setInviteOpen(false);
    } catch (error) {
      console.error('초대 실패:', error);
      // alert('초대 중 오류가 발생했습니다.');
      setAlertMessage('초대 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

  const handleLeaveClub = async () => {
    if (!user || isOwner) {
      // alert('클럽장은 클럽을 탈퇴할 수 없습니다. 클럽 삭제 기능을 이용해 주세요.');
      setAlertMessage('클럽장은 클럽을 탈퇴할 수 없습니다. 클럽 삭제 기능을 이용해 주세요.');
      setIsAlertOpen(true);
      return;
    }
    try {
      const batch = writeBatch(db);

      // 1. clubs/{clubId}/members/{userId} 에서 삭제
      const memberRef = doc(db, 'clubs', clubId, 'members', user.uid);
      batch.delete(memberRef);

      // 2. users/{userId}/myClubs/{clubId} 에서 삭제
      const myClubRef = doc(db, 'users', user.uid, 'myClubs', clubId);
      batch.delete(myClubRef);

      // 3. clubs/{clubId} 문서의 memberCount 1 감소
      const clubRef = doc(db, 'clubs', clubId);
      batch.update(clubRef, { memberCount: increment(-1) });

      await batch.commit();
      // alert('클럽에서 탈퇴했습니다.');
      setAlertMessage('클럽에서 탈퇴했습니다.');
      setIsAlertOpen(true);
      navigate('/clubs'); // 나의 클럽 목록으로 이동
    } catch (err) {
      console.error('클럽 탈퇴 실패:', err);
      // alert('클럽 탈퇴 중 오류가 발생했습니다.');
      setAlertMessage('클럽 탈퇴 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setLeaveOpen(false);
    }
  };

  const handleKickMember = async () => {
    if (!isOwner || !kickTarget) {
      // alert('클럽장만 멤버를 강퇴할 수 있습니다.');
      setAlertMessage('클럽장만 멤버를 강퇴할 수 있습니다.');
      setIsAlertOpen(true);
      return;
    }
    if (kickTarget.id === club.owner) {
      // alert('클럽장을 강퇴할 수 없습니다.');
      setAlertMessage('클럽장을 강퇴할 수 없습니다.');
      setIsAlertOpen(true);
      return;
    }
    try {
      const batch = writeBatch(db);

      // 1. clubs/{clubId}/members/{kickTargetId} 에서 삭제
      const memberRef = doc(db, 'clubs', clubId, 'members', kickTarget.id);
      batch.delete(memberRef);
      
      // 2. users/{kickTargetId}/myClubs/{clubId} 에서 삭제
      const myClubRef = doc(db, 'users', kickTarget.id, 'myClubs', clubId);
      batch.delete(myClubRef);

      // 3. clubs/{clubId} 문서의 memberCount 1 감소
      const clubRef = doc(db, 'clubs', clubId);
      batch.update(clubRef, { memberCount: increment(-1) });

      // 4. 강퇴당한 유저에게 알림 문서 생성 ---
      const notificationRef = doc(collection(db, 'users', kickTarget.id, 'notifications'));
      batch.set(notificationRef, {
          type: 'kick', // 알림 종류
          message: `'${club.name}' 클럽에서 강퇴되었습니다.`,
          createdAt: serverTimestamp(),
          isRead: false,
      });

      await batch.commit();
      // alert(`${kickTarget.username}님을 클럽에서 제외했습니다.`);
      setAlertMessage(`${kickTarget.username}님을 클럽에서 제외했습니다.`);
      setIsAlertOpen(true);
    } catch (err) {
      console.error('멤버 강퇴 실패:', err);
      // alert('멤버를 강퇴하는 중 오류가 발생했습니다.');
      setAlertMessage('멤버를 강퇴하는 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    } finally {
      setKickTarget(null); // 강퇴 대상 초기화 및 다이얼로그 닫기
    }
  };

  const handlePostAdded = () => {
    refreshPosts();
  };

  const openPopover = Boolean(anchorEl);

  return (
    <MainLayout title="클럽 상세">
      <Box p={2}>
        {/* 클럽 기본 정보 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={club.profileUrl || ''} alt={club.name} sx={{ width: 80, height: 80, mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">{club.name}</Typography>
            <Typography variant="body1" color="text.secondary">{`${club.region} (${club.memberCount} 명)`}</Typography>
          </Box>
        </Box>

        <Typography variant="body2" fontWeight="bold">클럽 소개</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {club.description || '클럽 소개가 없습니다.'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">클럽장</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {club.ownerName}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">클럽 생성일</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {club.createdAt ? dayjs(club.createdAt.toDate()).format('YYYY-MM-DD') : '날짜 정보 없음'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography fontSize="13" fontWeight="bold">멤버 목록</Typography>
          {isOwner && (
            <IconButton size="small" onClick={() => setInviteOpen(true)} title="멤버 추가">
              <GroupAddIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1, ml: 4 }}>
          {members.map(member => (
            <IconButton key={member.id} onClick={(e) => handleMemberClick(e, member)} sx={{ p: 0 }}>
              <Avatar src={member.photoUrl || ''} alt={member.username} sx={{ width: 36, height: 36 }} />
            </IconButton>
          ))}
        </Box>
        <Popover
          open={openPopover} anchorEl={anchorEl} onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
          transformOrigin={{ vertical: 'top', horizontal: 'left', }}
        >
          {selectedMember && (
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar src={selectedMember.photoUrl || ''} alt={selectedMember.username} sx={{ width: 52, height: 52 }} />
              <Box>
                <Typography variant="body2" fontWeight="bold">{selectedMember.username}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {selectedMember.role === 'owner' ? '클럽장' : selectedMember.role === 'admin' ? '관리자' : '멤버'}
                </Typography>
              </Box>
              {isOwner && user.uid !== selectedMember.id && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setKickTarget(selectedMember);
                    handlePopoverClose(); // 강퇴 버튼 클릭 시 Popover 닫기
                  }}
                  title="강퇴"
                >
                  <PersonRemoveIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          )}
        </Popover>
        <Divider sx={{ my: 1 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography fontSize="13" fontWeight="bold">클럽 게시판</Typography>
          {isMember && ( // 멤버만 글쓰기 버튼이 보이도록
            <IconButton size="small" onClick={() => setAddPostOpen(true)} title="새 글 작성">
              <CreateIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        <Posts 
          clubId={clubId}  posts={posts} loading={postsLoading} loadingMore={loadingMore} hasMore={hasMore} loadMore={loadMore} 
        />

      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        {isOwner && (
          <>
            <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
          </>
        )}
        {isMember && !isOwner && (
          <Button variant="outlined" color="error" onClick={() => setLeaveOpen(true)}>탈퇴</Button>
        )}
        <Button variant="contained" onClick={() => navigate('/clubs')}>뒤로</Button>
      </Stack>

      {isOwner && (
        <EditClubDialog 
          open={editOpen}  onClose={handleEditClose}  onUpdate={handleUpdate} clubData={club} clubId={clubId}
        />
      )}

      {isOwner && (
        <DeleteConfirmDialog 
          open={deleteOpen}  onClose={() => setDeleteOpen(false)}  onConfirm={handleDelete}
        >
          "{club.name}" 클럽을 정말 삭제하시겠습니까? <br />
          모든 관련 데이터가 삭제되며 이 작업은 되돌릴 수 없습니다.
        </DeleteConfirmDialog>
      )}

      {isOwner && (
        <InviteMemberDialog
          open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={handleInvite}
        />
      )}

      <AddPostDialog 
        open={addPostOpen} onClose={() => setAddPostOpen(false)} clubId={clubId} onSuccess={handlePostAdded}
        currentUserProfile={currentUserProfile}
      />

      <DeleteConfirmDialog open={leaveOpen} onClose={() => setLeaveOpen(false)} onConfirm={handleLeaveClub} title="탈퇴">
        "{club.name}" 클럽에서 정말 탈퇴하시겠습니까?
      </DeleteConfirmDialog>

      <DeleteConfirmDialog open={!!kickTarget} onClose={() => setKickTarget(null)} onConfirm={handleKickMember} title="강퇴">
        "{kickTarget?.username}"님을 정말로 강퇴시키겠습니까?
      </DeleteConfirmDialog>

      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default ClubDetailPage;