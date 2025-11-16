import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import Logo from '../../assets/Logo.png';
import { useTheme } from '@mui/material/styles';

const Loader = () => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.palette.background.default, // خلفية شفافة
                zIndex: 1400, // تأكد من أن الـ loader يظهر فوق كل شيء
            }}
        >
            <img src={Logo} alt="Logo" style={{ height: '80px', marginBottom: '16px' }} />
            <CircularProgress color="primary" />
            <Typography variant="body2" sx={{ mt: 2, color: theme.palette.text.secondary }}>
                Loading...
            </Typography>
        </Box>
    );
};

export default Loader;