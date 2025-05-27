import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { Album } from './pages/Album';
import { Auth } from './pages/Auth';
import { Home } from './pages/Home';

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <CartProvider>
                    <Header />
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/album/:id" element={<Album />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/admin" element={<AdminDashboard />} />
                        <Route
                            path="/admin/orders"
                            element={<AdminOrdersPage />}
                        />
                    </Routes>
                </CartProvider>
            </AuthProvider>
        </Router>
    );
};

export default App;
