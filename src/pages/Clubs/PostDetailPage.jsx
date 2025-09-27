import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, Box, Button, CircularProgress, Divider, IconButton, Paper, Stack, Typography } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderOutlinedIcon from '@mui/icons-material/FavoriteBorderOutlined';
import dayjs from 'dayjs';
import { doc, collection, query, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';

import useAuthState from '../../hooks/useAuthState';
import useSnapshotDocument from '../../hooks/useSnapshotDocument';
import usePostViewCount from '../../hooks/usePostViewCount';
import usePostLike from '../../hooks/usePostLike';
import MainLayout from '../../components/MainLayout';
import EditPostDialog from './dialogs/EditPostDialog';
import ConfirmDialog from '../../components/ConfirmDialog';
import AlertDialog from '../../components/AlertDialog';
import Comments from './components/Comments';

const PostDetailPage = () => {
  const { clubId, postId } = useParams();
  const navigate = useNavigate();

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const { user } = useAuthState();
  const { docData: post, loading: postLoading } = useSnapshotDocument(`clubs/${clubId}/posts`, postId);
  const { docData: currentUserProfile, loading: profileLoading } = useSnapshotDocument('users', user?.uid);
  const { isLiked, loading: likeLoading, toggleLike } = usePostLike(clubId, postId, post?.authorId);
  usePostViewCount(clubId, postId, post?.authorId);   // 조회수 증가

  const isAuthor = user?.uid === post?.authorId;

  const handleConfirmDelete = async () => {
    setDeleteDialogOpen(false);
    
    try {
      // 1. 삭제할 게시글과 댓글 컬렉션의 참조
      const postRef = doc(db, 'clubs', clubId, 'posts', postId);
      const commentsRef = collection(postRef, 'comments');

      // 2. 게시글에 달린 모든 댓글 문서를 가져옴
      const commentsQuery = query(commentsRef);
      const commentsSnapshot = await getDocs(commentsQuery);

      // 3. Batch Write(일괄 쓰기) 작업을 시작
      const batch = writeBatch(db);

      // 4. 가져온 모든 댓글 문서를 batch에 추가하여 삭제하도록 설정
      commentsSnapshot.forEach((commentDoc) => {
        batch.delete(commentDoc.ref);
      });

      // 5. 마지막으로 게시글 문서도 batch에 추가하여 삭제하도록 설정
      batch.delete(postRef);

      // 6. Batch에 담긴 모든 삭제 작업을 한 번에 실행
      await batch.commit();

      // 7. 모든 작업이 성공하면 목록 페이지로 이동
      navigate(`/clubs/${clubId}`);

    } catch (error) {
      console.error('Error deleting post and comments: ', error);
      setAlertMessage('게시글과 댓글 삭제 중 오류가 발생했습니다.');
      setIsAlertOpen(true);
    }
  };

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
            목록으로
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
          {isAuthor && (
            <Stack direction="row" spacing={1} mr={1}>
              <Button 
                variant="outlined" color="primary" 
                onClick={() => setEditDialogOpen(true)}
              >
                수정
              </Button>
              <Button 
                variant="outlined" color="error"
                onClick={() => setDeleteDialogOpen(true)}
              >
                삭제
              </Button>
            </Stack>
          )}
          <Button variant="contained" onClick={() => navigate(-1)}>
            뒤로
          </Button>
        </Box>
      </Box>

      {post && ( 
        <EditPostDialog
          open={editDialogOpen}
          onClose={() => setEditDialogOpen(false)}
          clubId={clubId}
          post={{ ...post, id: postId }}
        />
      )}
      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      >
        정말로 이 게시글을 삭제하시겠습니까? 
      </ConfirmDialog>
      <AlertDialog open={isAlertOpen} onClose={() => setIsAlertOpen(false)}>
        {alertMessage}
      </AlertDialog>
    </MainLayout>
  );
};

export default PostDetailPage;