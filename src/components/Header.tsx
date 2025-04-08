import { AppBar, Toolbar, Typography, useTheme } from '@mui/material';
import LogoImg from '../assets/luther-logo.jpg';

export const Header = () => {
    const theme = useTheme();
    return (
        <AppBar position="static" sx={{ backgroundColor: theme.palette.primary.main }}>
            <Toolbar sx={{ padding: '0 !important' }}>
                <img 
                    src={LogoImg} 
                    alt="Luther Logo" 
                    style={{ height: 70, marginRight: 16 }} 
                />
                <Typography variant="h6" component="div">
                    Luther
                </Typography>
            </Toolbar>
        </AppBar>
    );
}