import { ref, getStorage, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebaseConfig';
import { v4 as uuidv4 } from 'uuid';

/* firebase storage에 file upload */
export const uploadImageToFirebase = async (file, path = 'uploads') => {
  if (!file) 
    throw new Error('파일이 없습니다.');

  const fileRef = ref(storage, `${path}/${uuidv4()}_${file.name}`);
  await uploadBytes(fileRef, file);
  const downloadUrl = await getDownloadURL(fileRef);
  return downloadUrl;
};

/* firebase storage url에서 path 추출 */
export const getPathFromUrl = (url) => {
  const matches = url.match(/\/o\/(.*?)\?alt/);
  if (!matches || matches.length < 2) 
    return null;
  return decodeURIComponent(matches[1]);
};

/* 스토리지에서 이미지 삭제 */
export const deletePhotoFromStorage = async (url) => {
  if (!url) 
    return;
  const path = getPathFromUrl(url);
  if (!path) 
    return;
  const storage = getStorage();
  const photoRef = ref(storage, path);
  try {
    await deleteObject(photoRef);
    // console.log('✅ Firebase Storage에서 사진 삭제 완료');
  } catch (err) {
    console.warn('⚠️ Firebase Storage 삭제 실패:', err.message);
  }
};