import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';

export const Header = () => {
    const theme = useTheme();
    return (
        <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
            <Toolbar sx={{ padding: '0 !important' }}>
                <img 
                    src="/assets/luther-logo.jpg"
                    alt="Luther Logo"
                    style={{ height: 70, marginRight: 16 }} 
                />
                <Typography 
                    variant="h6" 
                    component="div"
                    onClick={() => window.location.href = '/'}
                    sx={{ cursor: 'pointer'}}
                >
                    Luther
                </Typography>
            </Toolbar>
        </AppBar>
    );
}