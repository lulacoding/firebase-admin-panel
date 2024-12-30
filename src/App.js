import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './components/auth/LoginPage';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './components/dashboard/Dashboard';
import UsersPage from './pages/users/UsersPage';
import ListingsPage from './pages/listings/ListingsPage';
import GoogleMapsLoader from './components/maps/GoogleMapsLoader';

function App() {
  return (
    <AuthProvider>
      <GoogleMapsLoader />
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="admin-layout">
                  <Header />
                  <div className="content-wrapper">
                    <Sidebar />
                    <main style={{ flex: 1, overflow: 'auto' }}>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/users" element={<UsersPage />} />
                        <Route path="/listings" element={<ListingsPage />} />
                      </Routes>
                    </main>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
