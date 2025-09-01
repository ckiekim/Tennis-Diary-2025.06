import React, { useState } from 'react';
import { 
  Avatar, Box, Button, CircularProgress, Dialog, DialogTitle, DialogContent,
	List, ListItem, ListItemAvatar, ListItemText, Stack, TextField,  
} from '@mui/material';
import usePaginatedNicknameUsers from '../../../hooks/usePaginatedNicknameUsers';

export default function InviteMemberDialog({ open, onClose, onInvite }) {
  const [searchTerm, setSearchTerm] = useState('');
  // 사용자가 '검색' 버튼을 눌렀을 때의 검색어를 별도로 관리
  const [submittedSearchTerm, setSubmittedSearchTerm] = useState('');

  // 훅 호출! 정렬 기준은 'nickname', 검색어는 submittedSearchTerm
  const { users, loading, loadingMore, hasMore, loadMore } = usePaginatedNicknameUsers('nickname', submittedSearchTerm);

  const handleSearch = () => {
    // 검색 버튼을 누르면 submittedSearchTerm을 업데이트하여 훅이 다시 실행되도록 함
    setSubmittedSearchTerm(searchTerm);
  };

  const handleInviteClick = (user) => {
    onInvite(user);
    // 필요하다면 초대 후 다이얼로그를 닫거나 검색 결과를 초기화 할 수 있음
    // onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>멤버 초대하기</DialogTitle>
      <DialogContent>
        <Stack direction="row" spacing={1} my={2}>
          <TextField 
            label="초대할 사용자 닉네임 검색" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
            size="small"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <Button onClick={handleSearch} variant="contained">검색</Button>
        </Stack>

        {loading ? (
          <Box textAlign="center"><CircularProgress /></Box>
        ) : (
          <List sx={{ maxHeight: 300, overflow: 'auto' }}>
            {users.length === 0 && submittedSearchTerm && (
              <ListItem><ListItemText primary="검색 결과가 없습니다." /></ListItem>
            )}
            {users.map(user => (
              <ListItem key={user.uid} secondaryAction={
                <Button edge="end" size="small" onClick={() => handleInviteClick(user)}>초대</Button>
              }>
                <ListItemAvatar><Avatar src={user.photo} /></ListItemAvatar>
                <ListItemText primary={user.nickname} secondary={`마일리지: ${user.mileage || 0}`} />
              </ListItem>
            ))}

            {/* 더 불러오기 버튼 */}
            {hasMore && (
              <ListItem sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? '불러오는 중...' : '더 보기'}
                </Button>
              </ListItem>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}