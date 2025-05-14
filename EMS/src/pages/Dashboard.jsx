import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user = { role: 'user' } }) => {
  const [stats, setStats] = useState({
    totalEmployees: 0,
    recentHires: [],
    departmentCounts: [],
    activityLogs: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found. Please log in again.');
        }

        const response = await axios.get(
          'http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/dashboard.php',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setStats(response.data.stats);
        } else {
          setError(response.data.message || 'Failed to fetch dashboard data.');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error.response || error.message);
        if (error.response && error.response.status === 401) {
          setError('Unauthorized access. Please log in again.');
        } else if (error.response && error.response.status === 403) {
          setError('You do not have permission to view this data.');
        } else {
          setError('Failed to load dashboard data. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <div className="bg-red-100 text-red-700 p-4 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/background.mp4" // Change to your video path
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm z-10" />
      {/* Main Content */}
      <div className="relative z-20 w-full max-w-6xl mx-auto p-2 sm:p-6 flex flex-col gap-8">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col items-center mb-2 border border-blue-100">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 text-center mb-2 tracking-tight drop-shadow">Dashboard</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50/80 rounded-xl shadow-lg p-6 flex flex-col items-center border border-blue-200">
            <h2 className="text-lg font-bold text-blue-700 mb-1">Total Employees</h2>
            <p className="text-4xl font-extrabold text-blue-900 drop-shadow-lg">{stats.totalEmployees}</p>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50/80 rounded-xl shadow-lg p-6 border border-green-200">
            <h2 className="text-lg font-bold text-green-700 mb-1">Recent Hires</h2>
            {stats.recentHires.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {stats.recentHires.map((hire, index) => (
                  <li key={index} className="text-gray-800">
                    <span className="font-semibold text-green-800">{hire.name}</span> - {hire.position} <span className="text-gray-500">({hire.department})</span><br />
                    <span className="text-xs text-gray-500">Hired on: {new Date(hire.hire_date).toLocaleDateString()}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent hires</p>
            )}
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50/80 rounded-xl shadow-lg p-6 border border-yellow-200">
            <h2 className="text-lg font-bold text-yellow-700 mb-1">Departments</h2>
            {stats.departmentCounts.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2">
                {stats.departmentCounts.map((dept, index) => (
                  <li key={index} className="text-gray-800">
                    <span className="font-semibold text-yellow-800">{dept.department}</span>: {dept.count}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No departments found</p>
            )}
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-blue-900">Recent Activity Logs</h2>
          {stats.activityLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {stats.activityLogs.map((log, index) => (
                <li key={index} className="py-2">
                  <p className="text-gray-700">
                    <span className="font-bold text-blue-700">{log.user_name}</span> - {log.action} {log.description ? (<span className="text-gray-500">({log.description})</span>) : null} at{' '}
                    <span className="text-xs text-gray-500">{log.created_at ? new Date(log.created_at).toLocaleString() : 'Invalid Date'}</span>
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No activity logs found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;