import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * 관리자에게 새로운 코트가 등록되었음을 알립니다.
 * @param {string} courtName - 사용자가 입력한 새로운 코트 이름
 * @param {object} userInfo - 코트를 등록한 사용자 정보 { uid, nickname }
 */
export const notifyAdminOfNewCourt = async (courtName, userInfo) => {
  try {
    const functions = getFunctions();
    const notifyAdmins = httpsCallable(functions, 'notifyAdminsOfNewCourt');
    
    await notifyAdmins({
      courtName: courtName,
      submitter: userInfo,
    });
    
    console.log('모든 관리자에게 새 코트 알림을 성공적으로 요청했습니다.');
  } catch (error) {
    console.error("관리자에게 알림을 요청하는 데 실패했습니다:", error);
  }
};