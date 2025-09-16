import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, Typography, TextField } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import usePaginatedUsers from '../../hooks/usePaginatedUsers';
import { PLACEHOLDER_URL } from '../../constants/admin';
import EmailIcon from '@mui/icons-material/Email';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';

const UserAdminPage = () => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('joinDate');
  const [locationSearchText, setLocationSearchText] = useState('');
  
  const { users, loading, loadingMore, hasMore, loadMore } = usePaginatedUsers(sortBy, locationSearchText);

  // Intersection Observer 로직 추가
  const observerRef = useRef(null);

  const handleObserver = useCallback((entries) => {
    const [target] = entries;
    if (target.isIntersecting && hasMore && !loading && !loadingMore) {
      loadMore();
    }
  }, [loadMore, hasMore, loading, loadingMore]);

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, { threshold: 0 });
    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }
    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [handleObserver]);

  const handleImageError = (e) => {
    e.target.src = '/img/no-image.jpeg'; 
  };

  return (
    <MainLayout title="사용자 관리">
      <Box sx={{ p: 1, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 120, maxWidth: 150 }}>
          <InputLabel id="sort-by-label">정렬</InputLabel>
          <Select
            labelId="sort-by-label"
            value={sortBy}
            label="정렬"
            onChange={(e) => setSortBy(e.target.value)}
          >
            <MenuItem value="joinDate">가입일순</MenuItem>
            <MenuItem value="nickname">닉네임순</MenuItem>
            <MenuItem value="mileage">마일리지순</MenuItem>
          </Select>
        </FormControl>

        {/* 지역 선택 Select를 TextField로 교체합니다. */}
        <TextField
          size="small"
          label="지역 검색"
          variant="outlined"
          value={locationSearchText}
          onChange={(e) => setLocationSearchText(e.target.value)}
          sx={{ maxWidth: 150 }}
        />
      </Box>

      {(loading && users.length === 0) ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Stack spacing={1} sx={{ mt: 1 }}>
            {users.map((user) => { 
              const isValidPhoto = user.photo && !user.photo.includes(PLACEHOLDER_URL);
              const photoSrc = isValidPhoto ? user.photo : '/img/no-image.jpeg';

              return (
                <Card sx={{ mb: 0, p: 0 }} key={user.uid} onClick={() => navigate(`/tools/user/${user.uid}`)}>
                  <Box sx={{ display:'flex', alignItems:'center' }}>
                    <Box
                      component="img" src={photoSrc} alt={user.nickname}
                      sx={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 24, display: 'block', marginLeft: '4px' }}
                      onError={handleImageError}
                    />
                    <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                      <Typography fontSize="13px" fontWeight="bold" noWrap>
                        {user.nickname}
                      </Typography>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <EmailIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography fontSize="12px">
                            {user.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <MonetizationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography fontSize="12px">
                            {user.mileage?.toLocaleString() || 0}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography fontSize="12px">
                            {user.joinDate}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOnIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography fontSize="12px">
                            {user.location}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              )}
            )}
          </Stack>
            
          {/* 감시할 요소 및 추가 로딩 인디케이터 */}
          <Box 
            ref={observerRef} 
            sx={{ display: 'flex', justifyContent: 'center', my: 2, height: '50px' }}
          >
            {loadingMore && <CircularProgress />}
            {!hasMore && !loadingMore && users.length > 0 && (
              <Typography variant="body2" color="text.secondary">마지막 목록입니다.</Typography>
            )}
          </Box>
        </>
      )}
    </MainLayout>
  );
};

export default UserAdminPage;
