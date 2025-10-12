import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ADMIN_UIDS } from '../constants/admin';

const ADMIN_UID = ADMIN_UIDS[0];

/**
 * 관리자에게 새로운 코트가 등록되었음을 알립니다.
 * @param {string} courtName - 사용자가 입력한 새로운 코트 이름
 * @param {object} userInfo - 코트를 등록한 사용자 정보 { uid, nickname }
 */
export const notifyAdminOfNewCourt = async (courtName, userInfo) => {
  try {
    const adminNotiRef = collection(db, 'users', ADMIN_UID, 'notifications');
    
    await addDoc(adminNotiRef, {
      message: `${userInfo.nickname}님이 새 코트(${courtName})를 입력했습니다.`,
      type: 'admin_new_court_request',  // 알림 타입
      status: 'pending',                // 'pending', 'approved', 'rejected' 상태 추가
      createdAt: serverTimestamp(),
      // link: '/tools/courts', 
      isRead: false,
      courtName: courtName,
      submitter: {
        uid: userInfo.uid,
        nickname: userInfo.nickname,
      }
    });
    console.log('관리자에게 새 코트 알림을 성공적으로 보냈습니다.');
  } catch (error) {
    console.error("관리자에게 알림을 보내는 데 실패했습니다:", error);
  }
};