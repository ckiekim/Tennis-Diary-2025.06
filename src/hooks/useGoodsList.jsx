import { useEffect, useState } from 'react';
// import { getAuth } from 'firebase/auth';
import { auth, db } from '../api/firebaseConfig';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';

const useGoodsList = (refreshKey = 0) => {
  const [goods, setGoods] = useState([]);
  const [loading, setLoading] = useState(true);
  // const auth = getAuth();

  useEffect(() => {
    const fetchGoods = async () => {
      const user = auth.currentUser;
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
  // }, [auth.currentUser, refreshKey]);
  }, [refreshKey]);

  return { goods, loading };
};

export default useGoodsList;
