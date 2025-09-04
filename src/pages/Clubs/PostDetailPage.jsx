import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import dayjs from 'dayjs';

import useAuthState from '../../hooks/useAuthState';
import useSnapshotDocument from '../../hooks/useSnapshotDocument';
import usePostViewCount from '../../hooks/usePostViewCount';
import usePostLike from '../../hooks/usePostLike';
import MainLayout from '../../components/MainLayout';
import Comments from './Comments';

const PostDetailPage = () => {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();

  const { user } = useAuthState();
  const { docData: post, loading: postLoading } = useSnapshotDocument(`clubs/${clubId}/posts`, postId);
  const { docData: currentUserProfile, loading: profileLoading } = useSnapshotDocument('users', user?.uid);
  const { isLiked, loading: likeLoading, toggleLike } = usePostLike(clubId, postId, post?.authorId);
  usePostViewCount(clubId, postId, post?.authorId);   // 조회수 증가

  const isAuthor = user?.uid === post?.authorId;

  if (postLoading || profileLoading) {
    return (
      <MainLayout title="게시글 로딩 중...">
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!post) {
    return (
      <MainLayout title="오류">
        <Paper sx={{ p: 2, m: 2, textAlign: 'center' }}>
          <Typography>게시글을 찾을 수 없습니다.</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            목록으로 돌아가기
          </Button>
        </Paper>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="게시글 상세">
      <Box p={1}>
        <Paper sx={{ p: 2 }}>
          {/* 헤더: 제목 */}
          <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
            {post.title}
          </Typography>

          {/* 메타 정보: 작성자, 작성일 */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <Avatar src={post.authorPhotoUrl || ''} alt={post.authorName} sx={{ width: 32, height: 32 }} />
            <Box>
              <Typography variant="body2" fontWeight="bold">{post.authorName}</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(post.createdAt?.toDate()).format('YYYY-MM-DD HH:mm')}
              </Typography>
            </Box>
          </Stack>
          <Divider sx={{ my: 2 }} />

          {/* 본문 내용 */}
          <Typography variant="body2" sx={{ minHeight: '200px', whiteSpace: 'pre-wrap', my: 3 }}>
            {post.content}
          </Typography>

          {/* 통계 정보: 조회수, 좋아요 */}
          <Stack direction="row" spacing={2} alignItems="center" color="text.secondary">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <VisibilityOutlinedIcon sx={{ fontSize: '1rem' }} />
              <Typography variant="caption">{post.viewCount || 0}</Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <IconButton 
                size="small" 
                onClick={toggleLike} 
                disabled={likeLoading || isAuthor} // 로딩 중 또는 본인 작성한 글일 때 비활성화
                sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
              >
                {isLiked ? <FavoriteIcon sx={{ fontSize: '1.1rem' }} /> : <FavoriteBorderOutlinedIcon sx={{ fontSize: '1.1rem' }} />}
              </IconButton>
              <Typography variant="body2">{post.likeCount || 0}</Typography>
            </Stack>
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Comments clubId={clubId} postId={postId} currentUserProfile={currentUserProfile} />
        </Paper>

        {/* 하단 버튼 */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button variant="contained" onClick={() => navigate(-1)}>
            목록으로
          </Button>
        </Box>
      </Box>
    </MainLayout>
  );
};

export default PostDetailPage;