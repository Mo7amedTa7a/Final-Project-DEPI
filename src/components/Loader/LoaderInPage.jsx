import React from 'react';
import { Box, CircularProgress } from '@mui/material';

const LoaderInPage = () => (
  <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
    <CircularProgress color="primary" />
  </Box>
);

export default LoaderInPage;
