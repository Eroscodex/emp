import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import EmployeeList from './pages/EmployeeList';
import AddEmployee from './pages/AddEmployee';
import EditEmployee from './pages/EditEmployee';
import Departments from './pages/Departments';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import NoPage from './pages/NoPage';
import ProfileSettings from './pages/ProfileSettings';

const AppRoutes = ({ isAuthenticated, user, setIsAuthenticated, setUser }) => {
  return (
    <Routes>
      <Route path="/signup" element={
        !isAuthenticated ? <SignUp /> : <Navigate to="/" replace />
      } />
      <Route path="/login" element={
        !isAuthenticated ? (
          <Login setIsAuthenticated={setIsAuthenticated} setUser={setUser} />
        ) : (
          <Navigate to="/" replace />
        )
      } />
      
      {/* Protected Admin Routes */}
      {isAuthenticated && user?.role === 'admin' ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/add-employee" element={<AddEmployee />} />
          <Route path="/edit-employee/:id" element={<EditEmployee />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/profile" element={<ProfileSettings user={user} setUser={setUser} />} />
        </>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}

      <Route path="*" element={<NoPage />} />
    </Routes>
  );
};

export default AppRoutes;

