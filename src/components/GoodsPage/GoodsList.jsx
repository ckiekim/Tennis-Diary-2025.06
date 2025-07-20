import React from 'react';
import { Box, Typography } from '@mui/material';

const GoodsList = () => {
	return (
		<Box
		sx={{
		  padding: 3,
		  textAlign: 'center',
		  paddingBottom: '80px',
		}}
	  >
		<Typography variant="h6" fontWeight="bold" gutterBottom>
		  용품
		</Typography>
		<Typography marginTop={10} variant="body1" color="text.secondary">
		  용품 목록
		</Typography>
	  </Box>
	);
}

export default GoodsList;