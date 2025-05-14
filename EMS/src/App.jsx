import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import NoPage from './pages/NoPage';
import ProfileSettings from './pages/ProfileSettings';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Departments from './pages/Departments';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only check auth once on mount
    if (hasCheckedAuth) return;
    setHasCheckedAuth(true);

    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
        // Only navigate if not already on a protected route
        if (location.pathname === '/login' || location.pathname === '/signup') {
          navigate('/', { replace: true });
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
        if (location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      if (location.pathname !== '/login') {
        navigate('/login', { replace: true });
      }
    }
    // eslint-disable-next-line
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
      <div className={`${isAuthenticated ? 'pt-16' : ''}`}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={
            !isAuthenticated ? (
              <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
            ) : (
              <Navigate to="/" replace />
            )
          } />

          {/* Protected routes - Admin only */}
          {isAuthenticated && user?.role === 'admin' && (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<ProfileSettings user={user} setUser={setUser} />} />
              <Route path="/employees" element={<EmployeeList />} />
              <Route path="/add-employee" element={<AddEmployee />} />
              <Route path="/edit-employee/:id" element={<EditEmployee />} />
              <Route path="/departments" element={<Departments />} />
            </>
          )}

          <Route path="*" element={
            isAuthenticated ? <NoPage /> : <Navigate to="/login" replace />
          } />
        </Routes>
      </div>
    </div>
  );
};

export default App;