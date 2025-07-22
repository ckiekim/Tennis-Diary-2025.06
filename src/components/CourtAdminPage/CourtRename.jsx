import { Button } from '@mui/material';
import { collection, getDocs, setDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '../../api/firebaseConfig';

// Rename collection 'court' to 'courts'
export default function CourtRename() {
  const oldName = 'court';
  const newName = 'courts';
  const renameCollection = async () => {
    const oldCollectionRef = collection(db, oldName);
    const snapshot = await getDocs(oldCollectionRef);
  
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const newDocRef = doc(db, newName, docSnap.id);
  
      // 새 컬렉션에 복사
      await setDoc(newDocRef, data);
  
      // 기존 문서 삭제 (선택)
      await deleteDoc(docSnap.ref);
    }
  
    console.log(`✅ 이름 변경 완료`);
  };

  return (
    <Button onClick={renameCollection}>컬렉션 이름 변경</Button>
  );
}

