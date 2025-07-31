import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../api/firebaseConfig';

const useGoodsList = (refreshKey = 0) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchGoods = async () => {
      const user = auth.currentUser;
      console.log(user);
      if (!user) {
        setGoods([]);
        setLoading(false); 
        return;
      }

      const goodsRef = collection(db, 'goods');
      const q = query(goodsRef, where('uid', '==', user.uid), orderBy('date', 'desc'));
      const snapshot = await getDocs(q);

      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setGoods(items);
      setLoading(false);
    };

    fetchGoods();
  }, [auth.currentUser, refreshKey]);

  return { goods, loading };
};

export default useGoodsList;
