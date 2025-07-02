import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, CardMedia, Stack, Typography, } from '@mui/material';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';
import BottomNav from '../components/BottomNav';

const ResultPage = () => {
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      const eventSnap = await getDocs(collection(db, 'events'));
      const courtSnap = await getDocs(collection(db, 'court'));
      // court 목록을 map으로 정리: name → photo
      const courtMap = {};
      courtSnap.docs.forEach(doc => {
        const courtData = doc.data();
        courtMap[courtData.name] = courtData.photo || '';
      });

      const resultList = [];

      eventSnap.docs.forEach(docSnap => {
      const data = docSnap.data();
      if (data.result) {
        const photo = courtMap[data.place] || ''; // 🔁 name 기준 매칭
        resultList.push({
          id: docSnap.id,
          ...data,
          photo,
        });
      }
    });

      // 최신순 정렬
      resultList.sort((a, b) => (a.date < b.date ? 1 : -1));
      setResults(resultList);
    };

    fetchResults();
  }, []);

  return (
    <>
      <Box sx={{ padding: 2, paddingBottom: '80px' }}>
        <Typography variant="h5" sx={{ textAlign: 'center', mb: 2 }}>
          🎾 테니스 다이어리
        </Typography>

        <Stack spacing={2}>
          {results.map((item) => (
            <Card key={item.id}>
              <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
                {/* ✅ 이미지 영역 */}
                <Box sx={{ width: 80, aspectRatio: '1 / 1', flexShrink: 0, display: 'flex', alignItems: 'center', }}>
                  <Box
                    component="img"
                    src={item.photo}
                    alt="court"
                    sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 0, }}
                    onError={(e) => (e.target.style.display = 'none')}
                  />
                </Box>

                {/* ✅ 텍스트 영역 */}
                <Box sx={{ px: 1.2, py: 1, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Typography fontSize="13px" fontWeight="bold" noWrap>
                    {`${item.date} (${formatDay(item.date)}) ${item.start_time}~${item.end_time}`}
                  </Typography>
                  <Typography fontSize="12px">{item.place} 테니스코트</Typography>
                  <Typography fontSize="12px">결과: {item.result}</Typography>
                  {item.source && (
                    <Typography fontSize="12px">소스: {item.source}</Typography>
                  )}
                </Box>
              </Box>
            </Card>
          ))}
        </Stack>
      </Box>
      <BottomNav />
    </>
  );
};

const formatDay = (dateStr) => {
  const date = new Date(dateStr);
  const day = ['일', '월', '화', '수', '목', '금', '토'][date.getDay()];
  return day;
};


export default ResultPage;