import { useState, useEffect } from 'react';
import { auth, db } from '../api/firebaseConfig';
import { collection, getDocs, query, where } from 'firebase/firestore';

export default function useTournaments(refreshKey = 0) {
  const [list, setList] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      setList([]);
      return;
    }

    const fetchTournaments = async () => {
      // events와 courts 정보를 병렬로 가져옵니다.
      const [eventSnap, courtSnap] = await Promise.all([
        // 1. 쿼리 조건을 '게임'에서 '대회'로 변경합니다.
        getDocs(query(collection(db, 'events'), where('uid', '==', user.uid), where('type', '==', '대회'))),
        getDocs(collection(db, 'courts')),
      ]);

      // 코트 이름을 key로, 사진 URL을 value로 하는 맵을 만듭니다.
      const courtMap = {};
      courtSnap.forEach(doc => {
        const { name, photo } = doc.data();
        courtMap[name] = photo || '';
      });

      const tournaments = [];
      eventSnap.forEach(doc => {
        const data = doc.data();
        // 2. 결과 유무와 상관없이 모든 대회 데이터를 리스트에 추가합니다.
        tournaments.push({
          id: doc.id,
          ...data,
          // 장소 이름과 일치하는 코트 사진이 있으면 사용하고, 없으면 빈 문자열을 할당합니다.
          photo: courtMap[data.place] || '',
        });
      });

      // 날짜순으로 내림차순 정렬합니다 (최신순).
      tournaments.sort((a, b) => (a.date < b.date ? 1 : -1));
      setList(tournaments);
    };

    fetchTournaments();
  }, [refreshKey]);

  return list;
}