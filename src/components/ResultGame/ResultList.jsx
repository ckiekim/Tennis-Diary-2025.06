import React, { useState } from 'react';
import { Stack } from '@mui/material';
import useResultsWithPhoto from '../../hooks/useResultsWithPhoto';
import { db } from '../../api/firebaseConfig';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import ResultCard from './ResultCard';

export default function ResultList() {
  const [refreshKey, setRefreshKey] = useState(0);
  const results = useResultsWithPhoto(refreshKey);

  const handleAddPhotoMemo = async (eventId, { memo, photos }) => {
    const docRef = doc(db, 'events', eventId);
    await updateDoc(docRef, {
      memo,
      photoList: arrayUnion(...photos),   // 사진은 여러 장 저장할 수 있으니 배열 유지
    });
    setRefreshKey(prev => prev + 1); // 리렌더링 트리거
  };

  return (
    <Stack spacing={1}>
      {results.map(item => 
        <ResultCard key={item.id} item={item} onAdd={handleAddPhotoMemo} />
      )}
    </Stack>
  );
}