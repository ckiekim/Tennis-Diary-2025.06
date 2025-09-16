import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Divider, Stack, Typography } from '@mui/material';
import dayjs from 'dayjs';

import useAuthState from '../../hooks/useAuthState';
import useSnapshotDocument from '../../hooks/useSnapshotDocument';
import useSnapshotSubcollection from '../../hooks/useSnapshotSubcollection';
import usePaginatedSubcollection from '../../hooks/usePaginatedSubcollection';
import usePaginatedClubSchedules from '../../hooks/usePaginatedClubSchedules';
import useCourtList from '../../hooks/useCourtList';
import { useClubDetailManager } from '../../hooks/useClubDetailManager';
import { db } from '../../api/firebaseConfig';
import { arrayUnion, collection, doc, getDocs, query, updateDoc, where, serverTimestamp, writeBatch } from 'firebase/firestore';

import MainLayout from '../../components/MainLayout';
import ClubHeader from './components/ClubHeader';
import ClubMemberList from './components/ClubMemberList';
import ClubScheduleSection from './components/ClubScheduleSection';
import ClubPostSection from './components/ClubPostSection';
import ClubDialogs from './components/ClubDialogs'; 
import AlertDialog from '../../components/AlertDialog';
import ResultDialog from '../Schedule/dialogs/ResultDialog';

const ClubDetailPage = () => {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [scheduleForm, setScheduleForm] = useState(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultTarget, setResultTarget] = useState(null);
  const [scheduleRefreshKey, setScheduleRefreshKey] = useState(0);
  const refreshSchedules = () => setScheduleRefreshKey(prev => prev + 1);

  const { user, loading: authLoading } = useAuthState();
  const { docData: club, loading: clubLoading } = useSnapshotDocument('clubs', clubId);
  const { documents: members, loading: membersLoading } = useSnapshotSubcollection(`clubs/${clubId}/members`, { orderByField: 'role' });
  const { 
    documents: posts, loading: postsLoading, loadingMore, hasMore, loadMore, refresh: refreshPosts 
  } = usePaginatedSubcollection(`clubs/${clubId}/posts`,
    { orderByField: 'createdAt', direction: 'desc', limitCount: 5 });
  const { 
    schedules: clubSchedules, 
    loading: schedulesLoading,
    loadingMore: schedulesLoadingMore,
    hasMore: schedulesHasMore,
    loadMore: schedulesLoadMore
  } = usePaginatedClubSchedules(clubId, scheduleRefreshKey);
  const { docData: currentUserProfile } = useSnapshotDocument('users', user?.uid);
  const courts = useCourtList();
  
  const manager = useClubDetailManager(clubId, user, members, refreshSchedules);

  const handleOpenAddSchedule = () => {
    if (club) {
      setScheduleForm({
        type: '정모',
        place: '',
        club: club.name, // 클럽 이름 미리 채우기
        date: dayjs().format('YYYY-MM-DD'), // 오늘 날짜로 초기화
      });
      manager.setAddScheduleOpen(true); // 매니저를 통해 다이얼로그 열기 상태만 변경
    }
  };

  const handleOpenResultDialog = (schedule) => {
    setResultTarget(schedule);
    setResultOpen(true);
  };

  const handleResultSubmit = async (id, { type, result, memo, photoList }) => {
    if (!id || !user?.uid) return;

    const resultsCollectionRef = collection(db, 'events', id, 'event_results');
    // 현재 유저가 이미 결과를 냈는지 확인
    const q = query(resultsCollectionRef, where('uid', '==', user.uid));
    const existingResultSnapshot = await getDocs(q);

    if (existingResultSnapshot.empty) {
      // 기존 결과가 없으면: 새로 생성 (Create)
      const batch = writeBatch(db);
      
      // 새 결과 문서 추가
      const newResultRef = doc(collection(db, 'events', id, 'event_results'));
      const dataToSave = {
        result, memo, uid: user.uid, eventId: id,
        createdAt: serverTimestamp(), photoList,
      };
      batch.set(newResultRef, dataToSave);

      // 부모 event 문서에 참여자 추가
      const eventRef = doc(db, 'events', id);
      batch.update(eventRef, { participantUids: arrayUnion(user.uid) });

      await batch.commit();

    } else {
      // 기존 결과가 있으면: 수정 (Update)
      const existingDocRef = existingResultSnapshot.docs[0].ref;
      await updateDoc(existingDocRef, {
        result,
        memo,
        photoList, // 사진은 덮어쓰기 (또는 arrayUnion으로 추가도 가능)
      });
    }

    setResultOpen(false);
    refreshSchedules();
  };

  const isLoading = authLoading || clubLoading || membersLoading || postsLoading || schedulesLoading;
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

  return (
    <MainLayout title="클럽 상세">
      <Box p={2}>
        <ClubHeader club={club} />
        <ClubMemberList
          members={members} isOwner={isOwner} user={user}
          anchorEl={manager.anchorEl} selectedMember={manager.selectedMember}
          onMemberClick={(e, member) => { manager.setAnchorEl(e.currentTarget); manager.setSelectedMember(member); }}
          onPopoverClose={() => manager.setAnchorEl(null)}
          onInviteClick={() => manager.setInviteOpen(true)}
          onKickClick={(member) => { manager.setKickTarget(member); manager.setAnchorEl(null); }}
        />
        <Divider sx={{ my: 1 }} />
        <ClubScheduleSection
          schedules={clubSchedules} isOwner={isOwner} isMember={isMember} user={user}
          onAddScheduleClick={handleOpenAddSchedule}
          onEditSchedule={(schedule) => {
            manager.setSelectedSchedule({ ...schedule, date: dayjs(schedule.date) });
            manager.setEditScheduleOpen(true);
          }}
          onDeleteSchedule={(schedule) => {
            manager.setSelectedSchedule(schedule);
            manager.setDeleteAllRecurring(false);
            manager.setDeleteScheduleOpen(true);
          }}
          onResultClick={handleOpenResultDialog}
          loadingMore={schedulesLoadingMore} hasMore={schedulesHasMore} onLoadMore={schedulesLoadMore}
        />
        <Divider sx={{ my: 1 }} />
        <ClubPostSection
          clubId={clubId} posts={posts}
          loading={postsLoading} loadingMore={loadingMore}
          hasMore={hasMore} loadMore={loadMore}isMember={isMember}
          onAddPostClick={() => manager.setAddPostOpen(true)} // 글쓰기 버튼 클릭 시 다이얼로그 열기
        />
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        {isOwner && (
          <>
            <Button variant="outlined" color="primary" onClick={() => manager.setEditOpen(true)}>수정</Button>
            <Button variant="outlined" color="error" onClick={() => manager.setDeleteOpen(true)}>삭제</Button>
          </>
        )}
        {isMember && !isOwner && (
          <Button variant="outlined" color="error" onClick={() => manager.setLeaveOpen(true)}>탈퇴</Button>
        )}
        <Button variant="contained" onClick={() => navigate('/clubs')}>뒤로</Button>
      </Stack>

      <ClubDialogs 
        manager={manager} club={club} clubId={clubId} isMember={isMember} isOwner={isOwner}
        scheduleForm={scheduleForm} setScheduleForm={setScheduleForm}
        currentUserProfile={currentUserProfile} onPostAdded={refreshPosts} courts={courts}
        isClubSchedule={true}
      />
      <ResultDialog 
        open={resultOpen}  target={resultTarget} 
        setOpen={setResultOpen}  onResult={handleResultSubmit}  uid={user?.uid}
      />

      <AlertDialog open={manager.isAlertOpen} onClose={() => manager.setIsAlertOpen(false)}>
        {manager.alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default ClubDetailPage;