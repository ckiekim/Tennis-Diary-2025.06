import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, IconButton, Tooltip, Typography } from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import formatDay from '../../utils/formatDay';
import AddPhotoDialog from './dialogs/AddPhotoDialog';

export default function ResultCard({ item, onAdd }) {
  const navigate = useNavigate();
  const [addOpen, setAddOpen] = useState(false);
  const day = formatDay(item.date);
  const hasDetails = item.memo || (item.photoList && item.photoList.length > 0);

  return (
    <Card sx={{ mb: 0, p: 0 }}>
      <Box sx={{ display:'flex', alignItems:'stretch' }}>
        <Box
          component="img" src={item.photo} alt="court"
          sx={{ width: 82, height: 82, objectFit: 'cover', borderRadius: 0, display: 'block', }}
          onError={(e) => (e.target.style.display = 'none')}
        />

        <Box sx={{ flex: 1, px: 1.2, py: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Typography fontSize="13px" fontWeight="bold" noWrap>
            {`${item.date} (${day}) ${item.time}`}
          </Typography>
          <Typography fontSize="12px">
            {item.place} 테니스코트
          </Typography>
          <Typography fontSize="12px">
            결과: {item.result}
          </Typography>
          {item.source && 
            <Typography fontSize="12px">
              소스: {item.source}
            </Typography>
          }
        </Box>

        {/* 버튼 영역 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: 1 }}>
          <Tooltip title="사진 또는 메모 추가">
            <IconButton onClick={() => setAddOpen(true)} size="small">
              <AddPhotoAlternateIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
        <Box display="flex" justifyContent="flex-end" alignItems="center" px={1} pb={1}>
          {hasDetails && (
            <IconButton onClick={() => navigate(`/result/${item.id}`)}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>

      <AddPhotoDialog open={addOpen} onClose={() => setAddOpen(false)} item={item} onAdd={onAdd} />
    </Card>
  );
}

