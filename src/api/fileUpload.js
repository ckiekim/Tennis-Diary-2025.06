import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

export const uploadCourtsImageToFirebase = async (file) => {
  const fileRef = ref(storage, `courts/${uuidv4()}-${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
};

export const uploadGoodsImageToFirebase = async (file) => {
  const fileRef = ref(storage, `goods/${uuidv4()}-${file.name}`);
  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);
  return url;
};

export const uploadImageToFirebase = async (file, path = 'uploads') => {
  if (!file) throw new Error('파일이 없습니다.');

  const fileRef = ref(storage, `${path}/${uuidv4()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};
