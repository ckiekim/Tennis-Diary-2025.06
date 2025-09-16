import React, { useRef, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import usePaginatedTournamentsWithResults from '../../hooks/usePaginatedTournamentsWithResults';
import useAuthState from '../../hooks/useAuthState';
import TournamentCard from './components/TournamentCard';

const ResultTournamentPage = () => {
  const { user } = useAuthState();
  const { tournaments, loading, hasMore, fetchMore } = usePaginatedTournamentsWithResults(user?.uid);

  const observerRef = useRef();

  const handleFetchMore = useCallback(() => {
    if (loading || !hasMore) return;
    fetchMore();
  }, [loading, hasMore, fetchMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleFetchMore();
        }
      },
      { threshold: 1.0 }
    );

    const currentElement = observerRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [handleFetchMore]);

  return (
    <MainLayout title='대회 결과'>
      {/* 초기 로딩 */}
      {loading && tournaments.length === 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* 데이터 없음 */}
      {!loading && tournaments.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography>대회 결과가 없습니다.</Typography>
        </Box>
      )}

      {/* 데이터 목록 */}
      {tournaments.length > 0 && (
        <Stack spacing={1}>
          {tournaments.map(item => 
            <TournamentCard key={item.id} item={item} />
          )}
        </Stack>
      )}
      
      {/* 무한 스크롤 트리거 및 하단 로딩 인디케이터 */}
      <Box 
        ref={observerRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
      >
        { (loading && hasMore) &&  <CircularProgress size={30} /> }
        {!hasMore && tournaments.length > 0 && (
          <Typography variant="body2" color="text.secondary">마지막 목록입니다.</Typography>
        )}
      </Box>
    </MainLayout>
  );
};

export default ResultTournamentPage;