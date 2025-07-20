import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../api/firebaseConfig';

const useGoodsList = (refreshKey = 0) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGoods = async () => {
      const goodsRef = collection(db, 'goods');
      const q = query(goodsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGoods(items);
      setLoading(false);
    };

    fetchGoods();
  }, [refreshKey]);

  return { goods, loading };
};

export default useGoodsList;
