import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Divider, Stack, Typography, CircularProgress } from '@mui/material';
import useAuthState from '../../hooks/useAuthState';
import useDocument from '../../hooks/useDocument';
import useSubcollection from '../../hooks/useSubcollection';
import formatDay from '../../utils/formatDay';
import MainLayout from '../../components/MainLayout';
import ResultItemCard from './components/ResultItemCard';

const GameDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [refreshKey, setRefreshKey] = useState(0);
  const { user } = useAuthState();

  // 1. 이벤트 기본 정보 가져오기
  const { docData: eventData, loading: eventLoading } = useDocument('events', id, refreshKey);

  // 2. 이벤트에 속한 모든 결과 목록 가져오기
  const resultsPath = id ? `events/${id}/event_results` : null;
  const { documents: eventResults, loading: resultsLoading } = useSubcollection(
    resultsPath,
    { orderByField: 'createdAt', orderByDirection: 'asc' }, // 시간순 정렬
    refreshKey
  );

  const handleRefresh = () => setRefreshKey(prev => prev + 1);

  const loading = eventLoading || resultsLoading;

  if (loading) {
    return (
      <MainLayout title='게임 상세'>
        <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
      </MainLayout>
    );
  }
  if (!eventData) {
    return <MainLayout title='게임 상세'><Typography p={2}>해당 일정을 찾을 수 없습니다.</Typography></MainLayout>;
  }

  const displayPlace = eventData.placeInfo.courtType === '실내'
    ? `${eventData.placeInfo.courtName} (실내)` : eventData.placeInfo.courtName;

  return (
    <MainLayout title='게임 상세'>
      <Box p={2}>
        {/* 공통 이벤트 정보 표시 */}
        <Typography variant="h6" gutterBottom>일정 정보</Typography>
        <Stack spacing={1} mb={3}>
          <Typography><b>일시:</b> {`${eventData.date} (${formatDay(eventData.date)}) ${eventData.time}`}</Typography>
          <Typography><b>장소:</b> {displayPlace} 테니스코트</Typography>
          {eventData.club?.name && <Typography><b>클럽:</b> {eventData.club.name}</Typography>}
        </Stack>
        <Divider />

        {/* 결과 목록 표시 */}
        <Box mt={2}>
          {eventResults.length > 1 && 
		  	    <Typography variant="h6" gutterBottom>결과 목록 ({eventResults.length}명)</Typography>
		      }
          {eventResults.length > 0 ? (
            eventResults.map(result => (
              <ResultItemCard
                key={result.id}
                eventId={id}
                eventData={eventData}
                resultData={result}
                currentUser={user}
                onUpdate={handleRefresh}
                isPersonal={eventResults.length===1}
              />
            ))
          ) : (
            <Typography>아직 입력된 결과가 없습니다.</Typography>
          )}
        </Box>
      </Box>

      <Stack direction="row" justifyContent="center" my={3}>
        <Button variant="contained" onClick={() => navigate(-1)}>목록으로</Button>
      </Stack>
    </MainLayout>
  );
};

export default GameDetailPage;