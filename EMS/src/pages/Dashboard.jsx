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
    <div className="p-6">
      <h1 className="text-3xl font-bold text-center mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold text-blue-700">Total Employees</h2>
          <p className="text-2xl">{stats.totalEmployees}</p>
        </div>
        <div className="bg-green-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold text-green-700">Recent Hires</h2>
          {stats.recentHires.length > 0 ? (
            <ul className="list-disc pl-5">
              {stats.recentHires.map((hire, index) => (
                <li key={index}>
                  {hire.name} - {hire.position} ({hire.department}) <br />
                  Hired on: {new Date(hire.hire_date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent hires</p>
          )}
        </div>
        <div className="bg-yellow-100 p-4 rounded shadow">
          <h2 className="text-xl font-bold text-yellow-700">Departments</h2>
          {stats.departmentCounts.length > 0 ? (
            <ul className="list-disc pl-5">
              {stats.departmentCounts.map((dept, index) => (
                <li key={index}>
                  {dept.department}: {dept.count}
                </li>
              ))}
            </ul>
          ) : (
            <p>No departments found</p>
          )}
        </div>
      </div>
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-xl font-bold mb-4">Recent Activity Logs</h2>
        {stats.activityLogs.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {stats.activityLogs.map((log, index) => (
              <li key={index} className="py-2">
                <p>
                  <span className="font-bold">{log.user_name}</span> - {log.action}{' '}
                  {log.description && `(${log.description})`} at{' '}
                  {log.created_at ? new Date(log.created_at).toLocaleString() : 'Invalid Date'}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity logs found</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;