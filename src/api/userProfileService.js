import { uploadImageToFirebase, deletePhotoFromStorage, getPathFromUrl } from './firebaseStorage';

/**
 * 사용자의 프로필 사진을 업데이트
 * 1. 기존 사진이 Firebase Storage에 있으면 삭제
 * 2. 새 사진을 'uid/settings' 경로에 업로드
 * 3. 새 사진의 다운로드 URL을 반환
 *
 * @param {object} user - uid를 포함한 Firebase 사용자 객체
 * @param {File} newPhotoFile - 업로드할 새 이미지 파일
 * @param {string|null} oldPhotoUrl - 현재 사용자의 프로필 사진 URL
 * @returns {Promise<string>} 새로 업로드된 사진의 다운로드 URL
 */
export const updateProfilePhoto = async (user, newPhotoFile, oldPhotoUrl) => {
  if (!user || !user.uid) {
    throw new Error('사용자 정보가 유효하지 않습니다.');
  }
  if (!newPhotoFile) {
    throw new Error('업로드할 파일이 없습니다.');
  }

  // 1. 기존 사진 삭제 로직
  // 기존 URL이 있고, 그 URL이 Firebase Storage URL인 경우에만 삭제 시도
  if (oldPhotoUrl) {
    const oldPath = getPathFromUrl(oldPhotoUrl);
    // oldPath가 존재하고, 해당 유저의 폴더에 있는 파일이 맞는지 확인 (안전장치)
    if (oldPath && oldPath.startsWith(user.uid)) {
      await deletePhotoFromStorage(oldPhotoUrl);
    }
  }

  // 2. 새 사진 업로드
  // 업로드 경로는 'uid/settings'로 지정
  const uploadPath = `${user.uid}/settings`;
  const newDownloadUrl = await uploadImageToFirebase(newPhotoFile, uploadPath);

  // 3. 새 URL 반환
  return newDownloadUrl;
};
