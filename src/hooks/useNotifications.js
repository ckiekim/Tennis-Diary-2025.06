import useSnapshotSubcollection from './useSnapshotSubcollection';

// 현재 로그인한 유저의 알림을 실시간으로 받아오는 훅
export default function useNotifications(uid) {
  const { documents: notifications, loading } = useSnapshotSubcollection(
    uid ? `users/${uid}/notifications` : null,
    { orderByField: 'createdAt', orderByDirection: 'desc' }
  );

  return { notifications, loading };
}