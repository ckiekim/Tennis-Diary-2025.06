import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CircularProgress, FormControl, InputLabel, MenuItem, Select, Stack, Typography, TextField } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import useUserList from '../../hooks/useUserList';

const UserAdminPage = () => {
  const navigate = useNavigate();
  const { users, loading, sortBy, locationSearchText, setSortBy, setLocationSearchText } = useUserList();

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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={1}>
          {users.map((user) => (
            <Card sx={{ mb: 0, p: 0 }} key={user.uid} onClick={() => navigate(`/admin/user/${user.uid}`)}>
              <Box sx={{ display:'flex', alignItems:'center' }}>
                <Box
                  component="img" src={user.photo} alt={user.nickname}
                  sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 30, display: 'block', marginLeft: '4px' }}
                  onError={(e) => (e.target.style.display = 'none')}
                />
                <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography fontSize="14px" fontWeight="bold" noWrap>
                    {user.nickname}
                  </Typography>
                  <Typography fontSize="13px">
                    {user.email}
                  </Typography>
                  <Typography fontSize="12px">
                    가입일: {user.joinDate}
                  </Typography>
                  <Typography fontSize="12px">
                    지역: {user.location}
                  </Typography>
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      )}
    </MainLayout>
  );
};

export default UserAdminPage;
