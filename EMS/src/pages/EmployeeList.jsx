import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEmployees = async (queryParams = {}) => {
    setIsLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No token found. Please log in again.');
      }

      const response = await axios.get(
        'http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/employees.php',
        {
          params: queryParams,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        setEmployees(response.data.employees || []);
      } else {
        setError(response.data.message || 'Failed to fetch employees.');
      }
    } catch (error) {
      console.error('Error fetching employees:', error.response || error.message);
      if (error.response && error.response.status === 401) {
        setError('Unauthorized access. Please log in again.');
      } else if (error.response && error.response.status === 500) {
        setError('Server error: Failed to fetch employees.');
      } else {
        setError('Failed to load employees. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/delete_employee.php?id=${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmployees(employees.filter((employee) => employee.id !== id));
    } catch (error) {
      console.error('Error deleting employee:', error.response || error.message);
      setError('Failed to delete employee. Please try again.');
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleSearch = async (searchTerm) => {
    try {
      fetchEmployees({ q: searchTerm });
    } catch (error) {
      console.error('Search failed:', error);
      setError('Failed to search employees. Please try again.');
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>Employee List</h1>
      <SearchBar onSearch={handleSearch} />
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Name</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Phone</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Department</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Position</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Hire Date</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Salary</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Profile Image</th>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.id}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.email}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.phone || 'N/A'}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.department_name}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.position}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {new Date(employee.hire_date).toLocaleDateString()}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {employee.salary ? `$${employee.salary}` : 'N/A'}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>{employee.status}</td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                {employee.profile_image ? (
                  <img
                    src={`http://localhost/FINAL%20PROJECT/EMS_BACKEND/uploads/${employee.profile_image}`}
                    alt="Profile"
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                ) : (
                  'No Image'
                )}
              </td>
              <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                <button
                  onClick={() => navigate(`/edit-employee/${employee.id}`)}
                  className="bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 ml-2"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeList;
