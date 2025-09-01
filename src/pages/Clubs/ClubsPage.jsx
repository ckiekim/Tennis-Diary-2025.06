import React, { useState } from 'react';
import { Box, CircularProgress, Fab, Stack, Typography } from '@mui/material';
import { db } from '../../api/firebaseConfig';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import dayjs from 'dayjs';

import { useMyClubs } from '../../hooks/useMyClubs';
import useAuthState from '../../hooks/useAuthState';
import useUserDoc from '../../hooks/useUserDoc';
import ClubCard from './ClubCard';
import MainLayout from '../../components/MainLayout'; 
import AddClubDialog from './dialogs/AddClubDialog'; 
import AddIcon from '@mui/icons-material/Add';

const ClubsPage = () => {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const { user, loading: authLoading } = useAuthState();
  const userId = user ? user.uid : null;
  const { clubs, loading: clubsLoading, error } = useMyClubs(userId, refreshKey);
  const { docData: userDoc } = useUserDoc(userId);

  const handleAddClub = async (clubData) => {
    if (!user) return alert('로그인이 필요합니다.');

    try {
      // 1. Firestore Write Batch 시작
      const batch = writeBatch(db);
      const now = serverTimestamp();

      // 2. 새로운 clubs 문서 참조 생성 (ID를 미리 확보)
      const newClubRef = doc(collection(db, 'clubs'));
      const newClubId = newClubRef.id;

      // 3. clubs 컬렉션에 문서 추가
      batch.set(newClubRef, {
        name: clubData.name,
        description: clubData.description,
        region: clubData.region,
        profileUrl: clubData.profileUrl || '',
        owner: user.uid,
        ownerName: userDoc.nickname,
        memberCount: 1,
        createdAt: now,
      });

      // 4. clubs/{clubId}/members 서브컬렉션에 클럽장 정보 추가
      const memberRef = doc(db, 'clubs', newClubId, 'members', user.uid);
      batch.set(memberRef, {
        username: userDoc.nickname,
        photoUrl: userDoc.photo,
        role: 'owner',
        joinedAt: now,
      });

      // 5. users/{userId}/myClubs 서브컬렉션에 클럽 정보 추가
      const myClubRef = doc(db, 'users', user.uid, 'myClubs', newClubId);
      batch.set(myClubRef, {
        clubName: clubData.name,
        profileUrl: clubData.profileUrl || '',
        region: clubData.region,
        ownerName: userDoc.nickname,
        role: 'owner',
        joinDate: dayjs().format('YYYY-MM-DD'),
      });

      // 6. 모든 쓰기 작업을 한 번에 실행
      await batch.commit();

      setAddOpen(false); // 성공 시 다이얼로그 닫기
      setRefreshKey(prevKey => prevKey + 1);
    } catch (err) {
      console.error("클럽 생성 중 에러 발생:", err);
      alert("클럽 생성에 실패했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <MainLayout title="나의 클럽">
      {authLoading && (
        <Box textAlign="center" mt={4}>
          <CircularProgress />
          <Typography mt={2}>사용자 정보를 확인하는 중입니다...</Typography>
        </Box>
      )}

      {!authLoading && !user && (
        <Box textAlign="center" mt={4}>
          <Typography>로그인 후 가입한 클럽을 확인해주세요.</Typography>
        </Box>
      )}

      {!authLoading && user && (
        <>
          {clubsLoading && (
            <Box textAlign="center" mt={4}>
              <CircularProgress />
              <Typography mt={2}>클럽 목록을 불러오는 중입니다...</Typography>
            </Box>
          )}

          {error && (
            <Box textAlign="center" mt={4}>
              <Typography color="error">오류가 발생했습니다: {error.message}</Typography>
            </Box>
          )}

          {!clubsLoading && !error && clubs.length === 0 && (
            <Box textAlign="center" mt={4}>
              <Typography>아직 가입한 클럽이 없습니다. 새로운 클럽을 찾아보세요!</Typography>
            </Box>
          )}

          {!clubsLoading && !error && clubs.length > 0 && (
            <Stack spacing={1}>
              {clubs.map(club => (
                <ClubCard  key={club.id}  club={club} />
              ))}
            </Stack>
          )}

          <Fab
            color="default"
            sx={{
              position: 'fixed', bottom: 80, right: 24, backgroundColor: 'black', color: 'white', zIndex: 20,
              '&:hover': { backgroundColor: '#333', },
            }}
            onClick={() => setAddOpen(true)}
          >
            <AddIcon /> 
          </Fab>

          <AddClubDialog
            open={addOpen}
            onClose={() => setAddOpen(false)}
            onAdd={handleAddClub}
            uid={userId}
          />
        </>
      )}
    </MainLayout>
  );
};

export default ClubsPage;