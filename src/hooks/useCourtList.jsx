import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useCourtList = () => {
  const [courts, setCourts] = useState([]);

  useEffect(() => {
    const fetchCourts = async () => {
      const querySnapshot = await getDocs(collection(db, 'court'));
      const result = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        result.push({
          id: doc.id,
          name: data.name,
          surface: data.surface,
          is_indoor: data.is_indoor,
          photo: data.photo,
          location: data.location,
        });
      });
      setCourts(result);
    };

    fetchCourts();
  }, []);

  return courts;
};

export default useCourtList;
