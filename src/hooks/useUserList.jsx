import { useState, useEffect, useMemo } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

export default function useUserList() {
  const [rawUsers, setRawUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('joinDate');
  const [locationSearchText, setLocationSearchText] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, 'users');
        const userSnapshot = await getDocs(usersCollection);
        const userList = userSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));
        setRawUsers(userList);
      } catch (error) {
        console.error("Error fetching users: ", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const users = useMemo(() => {
    let processedUsers = [...rawUsers];

    // 1. 필터링 (지역 텍스트 검색)
    // 검색어가 있을 경우에만 필터링을 수행
    if (locationSearchText.trim()) {
      processedUsers = processedUsers.filter(user => 
        user.location.includes(locationSearchText.trim())
      );
    }

    // 2. 정렬 (가입일순, 닉네임순)
    if (sortBy === 'joinDate') {
      processedUsers.sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate));
    } else if (sortBy === 'nickname') {
      processedUsers.sort((a, b) => a.nickname.localeCompare(b.nickname));
    }

    return processedUsers;
  }, [rawUsers, sortBy, locationSearchText]);

  return { 
    users, loading,  sortBy,  locationSearchText,  setSortBy,  setLocationSearchText
  };
}
