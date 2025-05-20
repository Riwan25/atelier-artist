import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const LogoutButton = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/auth');
    };

    return (
        <Button color="inherit" onClick={handleLogout}>
            Logout
        </Button>
    );
};
