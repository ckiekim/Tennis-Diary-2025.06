import { useState, useEffect, useRef } from 'react';
import { Alert, Avatar, Box, Button, CircularProgress, Container, FormControl, Grid, IconButton, InputLabel,
  MenuItem, Paper, Select, TextField, Tooltip, Typography } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import MainLayout from '../../components/MainLayout';
import useAuthState from '../../hooks/useAuthState';
import useUserSettings from '../../hooks/useUserSettings';
import { updateProfilePhoto } from '../../api/userProfileService';
import KOREA_DISTRICTS from '../../data/korea-administrative-districts.json';

const UserSettingPage = () => {
  const { user } = useAuthState();
  const { settings, loading, error, updateSettings } = useUserSettings();
  
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [nickname, setNickname] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [province, setProvince] = useState(''); // 광역시도
  const [city, setCity] = useState('');         // 기초자치단체

  // Firestore에서 데이터를 가져오면 로컬 state에 반영
  useEffect(() => {
    if (settings) {
      setNickname(settings.nickname || '');
      if (settings.location) {
        const [prov, cty] = settings.location.split(' ');
        setProvince(prov || '');
        setCity(cty || '');
      }
    }
  }, [settings]);

  const handleEditPhotoClick = () => {
    fileInputRef.current.click();
  };

  const handlePhotoChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsPhotoUploading(true);
    try {
      // 1. 사진 업로드 및 기존 사진 삭제 (서비스 함수 호출)
      const newPhotoUrl = await updateProfilePhoto(user, file, settings?.photo);
      // 2. Firestore에 새 URL 업데이트
      await updateSettings({ photo: newPhotoUrl });
      alert('프로필 사진이 성공적으로 변경되었습니다.');
    } catch (err) {
      console.error('프로필 사진 변경 실패:', err);
      alert('프로필 사진 변경에 실패했습니다.');
    } finally {
      setIsPhotoUploading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const location = province && city ? `${province} ${city}` : '';
      await updateSettings({ nickname, location, });
      alert('설정이 성공적으로 저장되었습니다.');
    } catch (err) {
      console.error("설정 저장 실패:", err);
      alert('설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleProvinceChange = (event) => {
    setProvince(event.target.value);
    setCity(''); // 시/군/구 선택 초기화
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
        <Paper elevation={3} sx={{ p: 2 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
            <Box sx={{ position: 'relative', mb: 2 }}>

              <Avatar 
                src={settings?.photo}  alt={settings?.nickname} 
                sx={{ width: 100, height: 100, mb: 3, opacity: isPhotoUploading ? 0.5 : 1 }}  
              />
              {isPhotoUploading && (
                <CircularProgress size={116} sx={{ position: 'absolute', top: -8, left: -8, zIndex: 1, }} />
              )}
              <input
                type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }}
              />
              <Tooltip title="프로필 사진 변경">
                <IconButton
                  onClick={handleEditPhotoClick} disabled={isPhotoUploading} size="small"
                  sx={{ position: 'absolute', bottom: 10, right: -5, backgroundColor: 'background.paper',
                    '&:hover': { backgroundColor: 'action.hover' }
                  }}
                >
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Box>
            <Typography variant="caption" color="text.secondary">
              프로필 사진은 가입한 Google 또는 Kakao 계정에서 변경할 수 있습니다.
            </Typography>
          </Box>

          <TextField
            label="이메일" value={settings?.email || ''} fullWidth margin="normal" InputProps={{ readOnly: true }}
            disabled // 이메일은 변경 불가
          />
          <TextField label="닉네임" value={nickname} onChange={(e) => setNickname(e.target.value)} fullWidth margin="normal" />
          
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>지역 정보</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel id="province-select-label">광역시/도</InputLabel>
                <Select
                  labelId="province-select-label" id="province-select" value={province} label="광역시/도"
                  onChange={handleProvinceChange}
                >
                  {Object.keys(KOREA_DISTRICTS).map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth disabled={!province}>
                <InputLabel id="city-select-label">시/군/구</InputLabel>
                <Select
                  labelId="city-select-label" id="city-select" value={city} label="시/군/구"
                  onChange={(e) => setCity(e.target.value)}
                >
                  {province && KOREA_DISTRICTS[province].map((cty) => (
                    <MenuItem key={cty} value={cty}>
                      {cty}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <TextField label="가입일" value={settings?.joinDate || ''} fullWidth margin="normal" disabled InputProps={{ readOnly: true }} />

          <Box mt={3} textAlign="right">
            <Button variant="contained"  onClick={handleSave} disabled={isSaving}>
              {isSaving ? <CircularProgress size={24} /> : '저장하기'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </MainLayout>
  );
};

export default UserSettingPage;