import { faScrewdriverWrench } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    AppBar,
    Box,
    Button,
    Container,
    IconButton,
    Toolbar,
    Typography,
    useTheme,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CartDropdown } from './CartDropdown';
import { LogoutButton } from './LogoutButton';

export const Header = () => {
    const theme = useTheme();
    const { isAuthenticated, user } = useAuth();
    const isAdmin = user && user.role === 'admin';

    return (
        <AppBar
            position="static"
            sx={{
                backgroundColor: theme.palette.primary.main,
            }}
        >
            <Container maxWidth="xl" sx={{ paddingLeft: '0 !important' }}>
                <Toolbar sx={{ padding: '0 !important' }}>
                    <img
                        src="/assets/luther-logo.jpg"
                        alt="Luther Logo"
                        style={{ height: 70, marginRight: 16 }}
                    />
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            color: 'white',
                            textDecoration: 'none',
                        }}
                    >
                        Luther
                    </Typography>
                    <Box>
                        {isAuthenticated ? (
                            <>
                                {isAdmin && (
                                    <IconButton
                                        color="inherit"
                                        component={RouterLink}
                                        to="/admin"
                                        sx={{ mr: 1 }}
                                        title="Admin Dashboard"
                                    >
                                        <FontAwesomeIcon
                                            icon={faScrewdriverWrench}
                                        />
                                    </IconButton>
                                )}{' '}
                                <CartDropdown />
                                <LogoutButton />
                            </>
                        ) : (
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/auth"
                            >
                                Login / Register
                            </Button>
                        )}
                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
};
