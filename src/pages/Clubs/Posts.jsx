import { memo } from 'react';
import { Link as RouterLink } from 'react-router-dom'; // [수정] Link 컴포넌트 임포트
import { Box, Button, CircularProgress, Divider, Link as MuiLink, List, ListItem, ListItemText, Paper, Typography } from '@mui/material'; // [수정] ListItemButton 대신 ListItem 사용, ListItemText는 그대로
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'; 
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined'; 
import dayjs from 'dayjs';

const Posts = memo(({clubId, posts, loading, loadingMore, hasMore, loadMore }) => {
  if (loading) {
    return (
      <Paper variant="outlined" sx={{ mt: 1, p: 2, textAlign: 'center' }}>
        <CircularProgress size={30} />
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mt: 1 }}>
      {posts.length === 0 ? (
        <Typography sx={{ p: 2, color: 'text.secondary' }}>
          작성된 게시글이 없습니다.
        </Typography>
      ) : (
        <List dense sx={{ p: 0 }}>
          {posts.map((post, index) => (
            <div key={post.id}>
              <ListItem
                alignItems="flex-start" // 텍스트가 여러 줄일 때 정렬
                sx={{ py: 0, px: 1 }} // 패딩 조절
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0 }}>
                      {/* 제목과 댓글 수 */}
                      <MuiLink
                        component={RouterLink}
                        to={`/clubs/${clubId}/posts/${post.id}`}
                        underline="hover"
                        color="primary" 
                        sx={{ fontWeight: 'bold' }}
                      >
                        <Typography variant="body2">
                          {post.title}
                          {post.commentCount > 0 ? ` [${post.commentCount}]` : ''}
                        </Typography>
                      </MuiLink>
                    </Box>
                  }
                  secondary={
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography
                        component="span"
                        variant="caption" // 더 작은 폰트
                        color="text.secondary"
                      >
                        {`${post.authorName} · ${dayjs(post.createdAt?.toDate()).format('YY-MM-DD HH:mm')}`}
                      </Typography>
                      {/* 조회수와 좋아요수 */}
                      <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'flex-end',
                        flexShrink: 0, // 공간이 부족해도 줄어들지 않음
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'text.secondary' }}>
                          <VisibilityOutlinedIcon sx={{ fontSize: '0.9rem', mr: 0.3 }} />
                          {post.viewCount || 0}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.75rem', color: 'text.secondary', ml: 1 }}>
                          <FavoriteBorderOutlinedIcon sx={{ fontSize: '0.9rem', mr: 0.3 }} />
                          {post.likeCount || 0}
                        </Box>
                      </Box>
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                />
              </ListItem>
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
        <Button fullWidth onClick={loadMore} sx={{ mt: 0.2 }}>
          더보기
        </Button>
      )}
    </Paper>
  );
});

export default Posts;