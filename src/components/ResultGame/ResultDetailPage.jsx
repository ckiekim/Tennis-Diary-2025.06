import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../../api/firebaseConfig';
import { Box, Typography, Divider, ImageList, ImageListItem } from '@mui/material';

const ResultDetailPage = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      const docRef = doc(db, 'events', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setResult({ id: docSnap.id, ...docSnap.data() });
      }
    };
    fetchResult();
  }, [id]);

  if (!result) return <Typography>로딩 중...</Typography>;

  return (
    <Box p={2}>
      <Typography variant="h6">메모</Typography>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', mt: 1 }}>
        {result.memo || '메모 없음'}
      </Typography>

      <Divider sx={{ my: 2 }} />

      <Typography variant="h6">사진</Typography>
      {result.photoList?.length > 0 ? (
        <ImageList cols={3} gap={8} sx={{ mt: 1 }}>
          {result.photoList.map((url, index) => (
            <ImageListItem key={index}>
              <img src={url} alt={`photo-${index}`} loading="lazy" />
            </ImageListItem>
          ))}
        </ImageList>
      ) : (
        <Typography variant="body2">사진 없음</Typography>
      )}
    </Box>
  );
};

export default ResultDetailPage;
