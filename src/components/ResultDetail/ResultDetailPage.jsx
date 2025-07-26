import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Box, Button, Dialog, DialogContent, Divider, ImageList, ImageListItem, Stack, Typography } from '@mui/material';
import useEventDoc from '../../hooks/useEventDoc';
import formatDay from '../../utils/formatDay';
import MainLayout from '../MainLayout';
import EditResultDialog from './dialogs/EditResultDialog';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../api/firebaseConfig';

const ResultDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const { docData: result, loading } = useEventDoc('events', id);

  if (loading) return <Typography>로딩 중...</Typography>;
  if (!result) return <Typography>데이터가 없습니다.</Typography>;

  const handleOpen = (url) => {
    setSelectedImage(url);
    setImageOpen(true);
  };

  const handleClose = () => {
    setImageOpen(false);
    setSelectedImage('');
  };

  const handleDelete = async () => {
    const confirmed = window.confirm('이 기록을 삭제할까요?');
    if (!confirmed) return;
    await deleteDoc(doc(db, 'events', id));
    navigate(-1); // 이전 화면으로
  };

  if (!result) return <Typography>로딩 중...</Typography>;

  return (
    <MainLayout title='🎾 게임 상세'>
      <Box p={2}>
        <Typography variant="body2" fontWeight="bold">일시</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {`${result.date} (${formatDay(result.date)}) ${result.time}`}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">장소</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.place} 테니스코트
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">결과</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.result}
        </Typography>
        <Divider sx={{ my: 1 }} />

        {result.source && (
          <>
            <Typography variant="body2" fontWeight="bold">소스</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {result.source}
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        {result.price && (
          <>
            <Typography variant="body2" fontWeight="bold">비용</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
              {result.price.toLocaleString()}원
            </Typography>
            <Divider sx={{ my: 1 }} />
          </>
        )}

        <Typography variant="body2" fontWeight="bold">메모</Typography>
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1, ml: 4 }}>
          {result.memo || '메모 없음'}
        </Typography>
        <Divider sx={{ my: 1 }} />

        <Typography variant="body2" fontWeight="bold">사진</Typography>
        {result.photoList?.length > 0 ? (
          <ImageList cols={3} gap={8} sx={{ mt: 1, ml: 4 }}>
            {result.photoList.map((url, index) => (
              <ImageListItem key={index} onClick={() => handleOpen(url)} sx={{ cursor: 'pointer' }}>
                <img src={url} alt={`photo-${index}`} loading="lazy" />
              </ImageListItem>
            ))}
          </ImageList>
        ) : (
          <Typography variant="body2" sx={{ mt: 1, ml: 4 }}>사진 없음</Typography>
        )}
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center" my={3}>
        <Button variant="outlined" color="primary" onClick={() => setEditOpen(true)}>수정</Button>
        <Button variant="outlined" color="error" onClick={handleDelete}>삭제</Button>
        <Button variant="contained" onClick={() => navigate(-1)}>뒤로</Button>
      </Stack>

      {/* 확대 이미지 다이얼로그 */}
      <Dialog open={imageOpen} onClose={handleClose} fullWidth maxWidth="md">
        <DialogContent sx={{ p: 0 }}>
          <img src={selectedImage} alt="확대 이미지" style={{ width: '100%', height: 'auto' }} />
        </DialogContent>
      </Dialog>

      {/* 수정 다이얼로그 */}
      <EditResultDialog open={editOpen} onClose={() => setEditOpen(false)} result={result} />
    </MainLayout>
  );
};

export default ResultDetailPage;
