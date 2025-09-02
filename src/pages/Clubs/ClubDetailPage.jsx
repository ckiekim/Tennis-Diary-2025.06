import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, CircularProgress, Typography, Divider, Stack, Avatar, Paper, } from '@mui/material';
import dayjs from 'dayjs';

import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import useSubcollection from '../../hooks/useSubcollection'; 

import MainLayout from '../../components/MainLayout';
import EditClubDialog from './dialogs/EditClubDialog';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import InviteMemberDialog from './dialogs/InviteMemberDialog';
import { deleteDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';
import { deletePhotoFromStorage } from '../../api/firebaseStorage';

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { user, loading: authLoading } = useAuthState();
  const { docData: club, loading: clubLoading } = useDocument('clubs', clubId, refreshKey);
  
  const { documents: members, loading: membersLoading } = useSubcollection(
    `clubs/${clubId}/members`, { orderByField: 'role' }
  );
  const isLoading = authLoading || clubLoading || membersLoading;

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

  const handleEditClose = () => {
    setEditOpen(false);
    setRefreshKey((prev) => prev + 1); // 수정 후 데이터 새로고침
  };

  const handleDelete = async () => {
    if (!isOwner) {
      alert('클럽장만 삭제할 수 있습니다.');
      return;
    }
    try {
      // 1. 클럽 대표 이미지 스토리지에서 삭제
      if (club.profileUrl) {
        await deletePhotoFromStorage(club.profileUrl);
      }
      
      // 2. clubs 컬렉션에서 클럽 문서 삭제
      await deleteDoc(doc(db, 'clubs', clubId));

      // 참고: 실제 프로덕션에서는 Cloud Function을 사용하여
      // 이 클럽에 가입된 모든 유저의 myClubs 서브컬렉션에서도 해당 클럽 정보를 삭제하고,
      // members, schedules 서브컬렉션의 모든 문서를 삭제하는 작업이 필요합니다.

      setDeleteOpen(false);
      navigate('/more/clubs'); // 나의 클럽 목록으로 이동
    } catch (err) {
      console.error('클럽 삭제 실패:', err);
      alert('클럽 삭제 중 문제가 발생했습니다.');
    }
  };

  const handleInvite = async (invitedUser) => {
    try {
      // clubs/{clubId}/members/{userId} 경로에 'invited' 상태로 문서를 생성
      const memberRef = doc(db, 'clubs', clubId, 'members', invitedUser.uid);
      await setDoc(memberRef, {
        uid: invitedUser.uid,
        username: invitedUser.nickname,
        photoUrl: invitedUser.photo,
        role: 'member',
        status: 'invited',
        invitedAt: serverTimestamp(),
        clubId: clubId,
        clubName: club.name, 
        clubProfileUrl: club.profileUrl,
        region: club.region,           // region 필드 추가
        ownerName: club.ownerName,
      });
      alert(`${invitedUser.nickname}님을 초대했습니다.`);
      setInviteOpen(false);
    } catch (error) {
      console.error("초대 실패:", error);
      alert("초대 중 오류가 발생했습니다.");
    }
  };

  return (
    <MainLayout title="클럽 상세">
      <Box p={2}>
        {/* 클럽 기본 정보 */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar src={club.profileUrl || ''} alt={club.name} sx={{ width: 80, height: 80, mr: 2 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">{club.name}</Typography>
            <Typography variant="body1" color="text.secondary">{club.region}</Typography>
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

        <Typography variant="body2" fontWeight="bold">멤버 수</Typography>
        <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>
          {club.memberCount} 명
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
            <Button variant="contained" size="small" onClick={() => setInviteOpen(true)}>
              멤버 추가
            </Button>
          )}
        </Box>

        <Stack spacing={1} sx={{ mt: 1, ml: 4 }}>
          {members.map(member => (
            <Box key={member.id} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar src={member.photoUrl || ''} alt={member.username} sx={{ mr: 2 }} />
              <Box>
                <Typography fontSize="12">{member.username}</Typography>
                <Typography fontSize="12" color="text.secondary">
                  {member.role === 'owner' ? '클럽장' : member.role === 'admin' ? '관리자' : '멤버'}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
        <Divider sx={{ my: 1 }} />

        {/* 클럽 일정 (구현 필요) */}
        <Typography fontSize="13" fontWeight="bold" mt={1}>클럽 일정</Typography>
        <Paper variant="outlined" sx={{ mt: 1 }}>
          {/* TODO: schedules 배열을 map으로 렌더링 */}
          <Typography sx={{ p: 2 }}>클럽 일정이 없습니다. (구현 필요)</Typography>
        </Paper>
      </Box>

      {/* 액션 버튼 */}
      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        {isOwner && (
          <>
            <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>삭제</Button>
          </>
        )}
        <Button variant="contained" onClick={() => navigate(-1)}>뒤로</Button>
      </Stack>

      {/* 수정 다이얼로그 (생성 필요) */}
      {isOwner && (
        <EditClubDialog 
          open={editOpen} 
          onClose={handleEditClose} 
          clubData={club}
          clubId={clubId}
        />
      )}

      {/* 삭제 확인 다이얼로그 */}
      {isOwner && (
        <DeleteConfirmDialog 
          open={deleteOpen} 
          onClose={() => setDeleteOpen(false)} 
          onConfirm={handleDelete}
        >
          "{club.name}" 클럽을 정말 삭제하시겠습니까? <br />
          모든 관련 데이터가 삭제되며 이 작업은 되돌릴 수 없습니다.
        </DeleteConfirmDialog>
      )}

      {isOwner && (
        <InviteMemberDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          onInvite={handleInvite}
        />
      )}
    </MainLayout>
  );
};

export default ClubDetailPage;