import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
    id: number;
    email: string;
    role: 'user' | 'admin';
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
    checkAuth: () => boolean;
    getToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    // Check localStorage for auth token and user data on initial load
    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);

                // Verify token with backend
                verifyToken(token);
            } catch (error) {
                console.error(
                    'Error parsing user data from localStorage:',
                    error
                );
                // Clear invalid data
                localStorage.removeItem('user');
                localStorage.removeItem('auth_token');
            }
        }
    }, []);

    // Function to verify token validity with the backend
    const verifyToken = async (token: string) => {
        try {
            const response = await fetch(
                'http://localhost/atelier/atelier-artist/api/auth/me.php',
                {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (!response.ok) {
                // Token is invalid, log the user out
                logout();
            }
        } catch (error) {
            console.error('Error verifying token:', error);
        }
    };
    const login = (userData: User, token: string) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('auth_token', token);
    };

    const logout = async () => {
        try {
            // Call logout API with token
            const token = localStorage.getItem('auth_token');
            await fetch(
                'http://localhost/atelier/atelier-artist/api/auth/logout.php',
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error('Error during logout:', error);
        }

        // Remove user from state and localStorage regardless of API response
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('user');
        localStorage.removeItem('auth_token');
    };

    // Function to get the auth token for API requests
    const getToken = (): string | null => {
        return localStorage.getItem('auth_token');
    };

    const checkAuth = (): boolean => {
        return isAuthenticated;
    };
    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login,
                logout,
                checkAuth,
                getToken,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
