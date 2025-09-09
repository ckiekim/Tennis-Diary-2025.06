import { Box, IconButton, Typography } from '@mui/material';
import CreateIcon from '@mui/icons-material/Create';
import Posts from '../Posts'; // 기존 Posts 컴포넌트를 재사용합니다.

const ClubPostSection = ({
  clubId,
  posts,
  loading,
  loadingMore,
  hasMore,
  loadMore,
  isMember,
  onAddPostClick
}) => {
  return (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
        <Typography fontSize="13" fontWeight="bold">클럽 게시판</Typography>
        {isMember && ( // 멤버만 글쓰기 버튼이 보이도록 설정
          <IconButton size="small" onClick={onAddPostClick} title="새 글 작성">
            <CreateIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* 기존에 사용하던 Posts 컴포넌트를 그대로 활용합니다. */}
      <Posts 
        clubId={clubId}
        posts={posts}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        loadMore={loadMore} 
      />
    </>
  );
};

export default ClubPostSection;