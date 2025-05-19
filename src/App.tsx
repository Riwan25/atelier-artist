import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { Album } from './pages/Album';
import { Home } from './pages/Home';

const App = () => {
    return (
        <Router>
            <Header />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/album/:id" element={<Album />} />
            </Routes>
        </Router>
    );
};

export default App;
