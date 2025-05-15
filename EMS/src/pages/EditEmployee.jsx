import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department_id: '',
    position: '',
    hire_date: '',
    salary: '',
    address: '',
    profile_image: null,
    status: 'active'
  });
  const [currentImage, setCurrentImage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    const fetchEmployee = async () => {
      setIsLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/employees.php?id=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.employee) {
          const employee = response.data.employee;
          setFormData({
            name: employee.name || '',
            email: employee.email || '',
            phone: employee.phone || '',
            department_id: employee.department_id || '',
            position: employee.position || '',
            hire_date: employee.hire_date || '',
            salary: employee.salary || '',
            address: employee.address || '',
            profile_image: null,
            status: employee.status || 'active'
          });

          if (employee.profile_image) {
            setCurrentImage(employee.profile_image);
          }
        } else {
          setError('Employee not found');
        }
      } catch (error) {
        setError('Failed to load employee data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchDepartments = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/departments.php',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setDepartments(response.data.departments || []);
      } catch (error) {
        console.error('Failed to fetch departments', error);
      }
    };

    fetchEmployee();
    fetchDepartments();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const data = new FormData();
      for (const key in formData) {
        if (formData[key] !== null) {
          data.append(key, formData[key]);
        }
      }
      data.append('id', id);

      const response = await axios.post(
        'http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/edit_employee.php',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        navigate('/employees');
      } else {
        setError(response.data.message || 'Failed to update employee');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while updating the employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0">
        <source src="/src/assets/bg.mov" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-400/30 to-white/80 z-10"></div>
      <div className="relative z-20 p-4 sm:p-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900 tracking-wide drop-shadow">Edit Employee</h1>
            <button
              onClick={() => navigate('/employees')}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <div className="bg-white/90 p-6 rounded-lg shadow-md">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-gray-700 text-sm font-bold mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="department_id" className="block text-gray-700 text-sm font-bold mb-2">
                    Department *
                  </label>
                  <select
                    id="department_id"
                    name="department_id"
                    value={formData.department_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="position" className="block text-gray-700 text-sm font-bold mb-2">
                    Position *
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="hire_date" className="block text-gray-700 text-sm font-bold mb-2">
                    Hire Date *
                  </label>
                  <input
                    type="date"
                    id="hire_date"
                    name="hire_date"
                    value={formData.hire_date}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="salary" className="block text-gray-700 text-sm font-bold mb-2">
                    Salary
                  </label>
                  <input
                    type="number"
                    id="salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="status" className="block text-gray-700 text-sm font-bold mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-gray-700 text-sm font-bold mb-2">
                    Address
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                  ></textarea>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="profile_image" className="block text-gray-700 text-sm font-bold mb-2">
                    Profile Image
                  </label>
                  {currentImage && (
                    <div className="mb-2">
                      <img
                        src={`http://localhost/FINAL%20PROJECT/EMS_BACKEND/uploads/${currentImage}`}
                        alt="Current profile"
                        className="h-20 w-20 object-cover rounded border border-gray-300 shadow"
                      />
                      <p className="text-sm text-gray-600 mt-1">Current image</p>
                    </div>
                  )}
                  <input
                    type="file"
                    id="profile_image"
                    name="profile_image"
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    accept="image/*"
                  />
                  <p className="text-sm text-gray-600 mt-1">Leave empty to keep current image</p>
                </div>
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-300 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Updating...' : 'Update Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditEmployee;