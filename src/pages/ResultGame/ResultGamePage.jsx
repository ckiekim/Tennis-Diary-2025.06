import React, { useRef, useEffect, useCallback } from 'react';
import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import usePaginatedEventsWithResults from '../../hooks/usePaginatedEventsWithResults';
import useAuthState from '../../hooks/useAuthState';
import MainLayout from '../../components/MainLayout';
import GameCard from './GameCard';

const ResultGamePage = () => {
  const { user } = useAuthState();
  const { results, loading, hasMore, fetchMore } = usePaginatedEventsWithResults(user?.uid);

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
    <MainLayout title='게임 결과'>
      {/* 초기 로딩 */}
      {loading && results.length === 0 && (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      )}

      {/* 데이터 없음 */}
      {!loading && results.length === 0 && (
        <Box textAlign="center" mt={4}>
          <Typography>게임 결과가 없습니다.</Typography>
        </Box>
      )}

      {/* 데이터 목록 */}
      {results.length > 0 && (
        <Stack spacing={1}>
          {results.map(item => 
            <GameCard key={item.id} item={item} />
          )}
        </Stack>
      )}
      
      {/* 무한 스크롤 트리거 및 하단 로딩 인디케이터 */}
      <Box 
        ref={observerRef} 
        sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
      >
        { (loading && hasMore) &&  <CircularProgress size={30} /> }
        {!hasMore && results.length > 0 && (
          <Typography variant="body2" color="text.secondary">마지막 목록입니다.</Typography>
        )}
      </Box>
    </MainLayout>
  );

};

export default ResultGamePage;