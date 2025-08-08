import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundError = () => {
  return (
    <Container>
      <Box
        sx={{
          py: 12,
          maxWidth: 480,
          mx: 'auto',
          display: 'flex',
          minHeight: '80vh',
          textAlign: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h3" paragraph>
          페이지를 찾을 수 없습니다.
        </Typography>

        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          요청하신 페이지가 존재하지 않거나, 사용할 수 없는 페이지입니다.
        </Typography>

        <Button to="/" variant="contained" component={Link}>
          홈으로 돌아가기
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundError;