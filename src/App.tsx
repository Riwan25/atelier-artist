import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { Album } from './pages/Album';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <Header />
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/album/:id" element={<Album />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
            </AuthProvider>
        </Router>
    );
};

export default App;
