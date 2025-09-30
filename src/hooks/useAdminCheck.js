import { useMemo } from 'react';
import useAuthState from './useAuthState';
import { ADMIN_UIDS } from '../constants/admin';

export default function useAdminCheck() {
  const { user, loading } = useAuthState();

  const isAdmin = useMemo(() => {
    return user && ADMIN_UIDS.includes(user.uid);
  }, [user]);

  return { isAdmin, loading };
}