import React, { useCallback, useState, useEffect } from 'react';
import { db, functions } from '../../api/firebaseConfig'; 
import { httpsCallable } from 'firebase/functions'; 
import { collection, query, where, getDocs } from 'firebase/firestore';
import { ADMIN_UIDS } from '../../constants/admin';
import MainLayout from '../../components/MainLayout';
import { Box, Typography, Button, Stack, CircularProgress, Paper, Snackbar, Alert } from '@mui/material';
import AddCourtDialog from './dialogs/AddCourtDialog';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function CourtApprovalAdminPage() {
	const [pendingCourts, setPendingCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approvalRequest, setApprovalRequest] = useState(null);
  const [snackbarInfo, setSnackbarInfo] = useState({ open: false, message: '', severity: 'success' });
  const [rejectTarget, setRejectTarget] = useState(null); // 거절할 알림 객체
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false); 

	const ADMIN_UID = ADMIN_UIDS[0];

  const fetchPendingCourts = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'users', ADMIN_UID, 'notifications'),
        where('status', '==', 'pending'),
        where('type', '==', 'admin_new_court_request')
      );
      const querySnapshot = await getDocs(q);
      const courts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPendingCourts(courts);
    } catch (error) {
      console.error("Error fetching pending courts:", error);
      setSnackbarInfo({ open: true, message: '요청 목록을 불러오는데 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [ADMIN_UID]);

  useEffect(() => {
    fetchPendingCourts();
  }, [fetchPendingCourts]);

  // Cloud Function을 호출하는 함수
  const processCourtSubmission = httpsCallable(functions, 'processCourtSubmission');

  const handleOpenApproveDialog = (notification) => {
    setApprovalRequest(notification);
  };

  // AddCourtDialog에서 '저장'을 눌렀을 때 최종 실행될 함수
  const handleConfirmApproval = (finalCourtData) => {
    if (!approvalRequest) return;

    processCourtSubmission({
      notificationId: approvalRequest.id,
      action: 'approve',
      courtData: finalCourtData, // 다이얼로그에서 입력받은 최종 데이터를 전달
    })
    .then(() => {
      setSnackbarInfo({ open: true, message: `${finalCourtData.name} 코트 등록이 완료되었습니다.`, severity: 'success' });
      setPendingCourts(prev => prev.filter(court => court.id !== approvalRequest.id));
    })
    .catch(err => {
      setSnackbarInfo({ open: true, message: `처리 실패: ${err.message}`, severity: 'error' });
    })
    .finally(() => {
      setApprovalRequest(null); // 다이얼로그를 닫습니다.
    });
  };

  const handleReject = (notification) => {
    setRejectTarget(notification); // 어떤 항목을 거절할지 상태에 저장
    setIsRejectConfirmOpen(true); // 다이얼로그를 엶
  };

  const handleConfirmReject = () => {
    if (!rejectTarget) return;

    processCourtSubmission({
      notificationId: rejectTarget.id,
      action: 'reject'
    })
    .then(() => {
      setSnackbarInfo({ open: true, message: `${rejectTarget.courtName} 코트 등록을 거절했습니다.`, severity: 'info' });
      setPendingCourts(prev => prev.filter(court => court.id !== rejectTarget.id));
    })
    .catch(err => {
      setSnackbarInfo({ open: true, message: `처리 실패: ${err.message}`, severity: 'error' });
    })
    .finally(() => {
      setIsRejectConfirmOpen(false); // 다이얼로그를 닫음
      setRejectTarget(null); // 타겟 초기화
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbarInfo(prev => ({ ...prev, open: false }));
  };

  return (
    <MainLayout title='새 코트 승인'>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : pendingCourts.length === 0 ? (
        <Typography sx={{ textAlign: 'center', my: 4 }}>
          새로운 코트 등록 요청이 없습니다.
        </Typography>
      ) : (
        <Stack spacing={2} sx={{ p: 1 }}>
          {pendingCourts.map(noti => (
            <Paper key={noti.id} elevation={2} sx={{ p: 1 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="h6">{noti.courtName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    요청자: {noti.submitter.nickname}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" color="error" size="small" onClick={() => handleReject(noti)}>
                    거절
                  </Button>
                  <Button variant="contained" size="small" onClick={() => handleOpenApproveDialog(noti)}>
                    승인
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <AddCourtDialog
        open={!!approvalRequest}
        onClose={() => setApprovalRequest(null)}
        onSave={handleConfirmApproval}
        initialData={{ name: approvalRequest?.courtName }}
      />

      <ConfirmDialog
        open={isRejectConfirmOpen}
        onClose={() => setIsRejectConfirmOpen(false)}
        onConfirm={handleConfirmReject}
        title="거절"
      >
        "{rejectTarget?.courtName}" 코트 등록 요청을 거절하시겠습니까?
      </ConfirmDialog>

      <Snackbar
        open={snackbarInfo.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarInfo.severity} sx={{ width: '100%' }}>
          {snackbarInfo.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}