import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, CircularProgress, Divider, List, ListItemButton, ListItemText, Paper, Typography } from '@mui/material';
import dayjs from 'dayjs';
import usePaginatedSubcollection from '../../hooks/usePaginatedSubcollection';

// memo를 사용하여 clubId가 변경되지 않는 한 불필요한 리렌더링을 방지합니다.
const Posts = memo(({ clubId }) => {
  const navigate = useNavigate();

  const {
    documents: posts,
    loading: postsLoading,
    loadingMore,
    hasMore,
    loadMore,
  } = usePaginatedSubcollection(
    `clubs/${clubId}/posts`,
    { orderByField: 'createdAt', direction: 'desc', limitCount: 15 }
  );

  if (postsLoading) {
    return (
      <Paper variant="outlined" sx={{ mt: 1, p: 2, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Paper>
    );
  }

  return (
    <>
      <Typography fontSize="13" fontWeight="bold" mt={1}>클럽 게시판</Typography>
      <Paper variant="outlined" sx={{ mt: 1 }}>
        {posts.length === 0 ? (
          <Typography sx={{ p: 2, color: 'text.secondary' }}>
            작성된 게시글이 없습니다.
          </Typography>
        ) : (
          <List dense sx={{ p: 0 }}>
            {posts.map((post, index) => (
              <div key={post.id}>
                <ListItemButton onClick={() => navigate(`/clubs/${clubId}/posts/${post.id}`)}>
                  <ListItemText
                    primary={post.title} 
                    secondary={`${post.authorName} · ${dayjs(post.createdAt?.toDate()).format('YY-MM-DD HH:mm')}`}
                    primaryTypographyProps={{ variant: 'body2' }}
                    secondaryTypographyProps={{ variant: 'caption' }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    댓글 {post.commentCount || 0}
                  </Typography>
                </ListItemButton>
                {index < posts.length - 1 && <Divider component="li" />}
              </div>
            ))}
          </List>
        )}

        {/* 페이지네이션 UI */}
        {loadingMore && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <CircularProgress size={24} />
          </Box>
        )}
        {hasMore && !loadingMore && (
          <Button fullWidth onClick={loadMore} sx={{ mt: 1 }}>
            더보기
          </Button>
        )}
      </Paper>
    </>
  );
});

export default Posts;
