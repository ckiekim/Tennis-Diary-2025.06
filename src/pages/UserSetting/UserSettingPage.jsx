import { useState, useEffect } from 'react';
import { Alert, Avatar, Box, Button, CircularProgress, Container, Paper, TextField, Typography } from '@mui/material';
import MainLayout from '../../components/MainLayout';
import useUserSettings from '../../hooks/useUserSettings';

const UserSettingPage = () => {
  const { settings, loading, error, updateSettings } = useUserSettings();
  // 폼 입력을 위한 로컬 state
  const [nickname, setNickname] = useState('');
  const [location, setLocation] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Firestore에서 데이터를 가져오면 로컬 state에 반영
  useEffect(() => {
    if (settings) {
      setNickname(settings.nickname || '');
      setLocation(settings.location || '');
    }
  }, [settings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateSettings({ nickname, location, });
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error("설정 저장 실패:", err);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout title="프로필 설정">
        <Box display="flex" justifyContent="center" marginTop={10}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="프로필 설정">
        <Alert severity="error" sx={{ mt: 4 }}>사용자 정보를 불러오는 중 오류가 발생했습니다.</Alert>
      </MainLayout>
    );
  }

  return (
    <MainLayout title='프로필 설정'>
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Avatar src={settings?.photo}  alt={settings?.nickname}  sx={{ width: 100, height: 100, mb: 3 }}  />
            <Typography variant="caption" color="text.secondary">
              프로필 사진은 가입한 Google 또는 Kakao 계정에서 변경할 수 있습니다.
            </Typography>
            {/* <Tooltip title="Google 프로필 사진으로 동기화">
              <IconButton
                onClick={handleSyncPhoto}
                size="small"
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: -5,
                  backgroundColor: 'background.paper',
                  '&:hover': { backgroundColor: 'action.hover' }
                }}
              >
                <SyncIcon />
              </IconButton>
            </Tooltip> */}
          </Box>

          <TextField
            label="이메일" value={settings?.email || ''} fullWidth margin="normal" InputProps={{ readOnly: true }}
            disabled // 이메일은 변경 불가
          />
          <TextField label="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} fullWidth margin="normal" />
          <TextField
            label="지역 (예: 경기도 용인시)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
            margin="normal"
          />
          <TextField label="가입일" value={settings?.joinDate || ''} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />

          <Box mt={3} textAlign="right">
            <Button 
              variant="contained" 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? <CircularProgress size={24} /> : '저장하기'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default UserSettingPage;