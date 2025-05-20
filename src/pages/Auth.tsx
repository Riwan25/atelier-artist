import {
    Alert,
    Box,
    Button,
    Container,
    Paper,
    Snackbar,
    Tab,
    Tabs,
    TextField,
    Typography,
} from '@mui/material';
import { SyntheticEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`auth-tabpanel-${index}`}
            aria-labelledby={`auth-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export const Auth = () => {
    const navigate = useNavigate();
    const { login } = useAuth(); // Call the useAuth hook at the top level of the component
    const [tabValue, setTabValue] = useState(0);
    const [registerForm, setRegisterForm] = useState({
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: '',
    });
    const [alert, setAlert] = useState({
        open: false,
        message: '',
        severity: 'error' as 'error' | 'success',
    });
    const handleTabChange = (_event: SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setRegisterForm({
            ...registerForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLoginForm({
            ...loginForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleRegisterSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (registerForm.password !== registerForm.confirmPassword) {
            setAlert({
                open: true,
                message: 'Passwords do not match',
                severity: 'error',
            });
            return;
        }

        try {
            const response = await fetch(
                'http://localhost/atelier/atelier-artist/api/auth/register.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: registerForm.email,
                        password: registerForm.password,
                    }),
                }
            );

            const data = await response.json();
            console.log(data);

            if (response.ok) {
                setAlert({
                    open: true,
                    message: 'Registration successful! Please login.',
                    severity: 'success',
                });
                // Switch to login tab after successful registration
                setTabValue(0);
            } else {
                setAlert({
                    open: true,
                    message: data.message || 'Registration failed',
                    severity: 'error',
                });
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setAlert({
                open: true,
                message: 'An error occurred during registration',
                severity: 'error',
            });
        }
    };
    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(
                'http://localhost/atelier/atelier-artist/api/auth/login.php',
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: loginForm.email,
                        password: loginForm.password,
                    }),
                }
            );

            const data = await response.json();
            if (response.ok) {
                // Pass user data and token to the login function
                login(data.user, data.token);

                setAlert({
                    open: true,
                    message: 'Login successful!',
                    severity: 'success',
                });

                // Redirect to home page after successful login
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setAlert({
                    open: true,
                    message: data.message || 'Login failed',
                    severity: 'error',
                });
            }
        } catch (error) {
            console.error('Error during login:', error);
            setAlert({
                open: true,
                message: 'An error occurred during login',
                severity: 'error',
            });
        }
    };

    const handleCloseAlert = () => {
        setAlert({
            ...alert,
            open: false,
        });
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
            <Paper elevation={3} sx={{ borderRadius: 2 }}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs
                        value={tabValue}
                        onChange={handleTabChange}
                        aria-label="authentication tabs"
                        centered
                    >
                        <Tab label="Login" />
                        <Tab label="Register" />
                    </Tabs>
                </Box>

                {/* Register Form */}
                <TabPanel value={tabValue} index={0}>
                    <Typography
                        variant="h5"
                        component="h1"
                        align="center"
                        gutterBottom
                    >
                        Sign In
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleLoginSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="login-email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            autoFocus
                            value={loginForm.email}
                            onChange={handleLoginChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="login-password"
                            autoComplete="current-password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Sign In
                        </Button>
                    </Box>
                </TabPanel>

                {/* Login Form */}
                <TabPanel value={tabValue} index={1}>
                    <Typography
                        variant="h5"
                        component="h1"
                        align="center"
                        gutterBottom
                    >
                        Create an Account
                    </Typography>
                    <Box
                        component="form"
                        onSubmit={handleRegisterSubmit}
                        noValidate
                        sx={{ mt: 1 }}
                    >
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            value={registerForm.email}
                            onChange={handleRegisterChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="new-password"
                            value={registerForm.password}
                            onChange={handleRegisterChange}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="confirmPassword"
                            label="Confirm Password"
                            type="password"
                            id="confirmPassword"
                            autoComplete="new-password"
                            value={registerForm.confirmPassword}
                            onChange={handleRegisterChange}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2 }}
                        >
                            Register
                        </Button>
                    </Box>
                </TabPanel>
            </Paper>

            <Snackbar
                open={alert.open}
                autoHideDuration={6000}
                onClose={handleCloseAlert}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    onClose={handleCloseAlert}
                    severity={alert.severity}
                    sx={{ width: '100%' }}
                >
                    {alert.message}
                </Alert>
            </Snackbar>
        </Container>
    );
};
