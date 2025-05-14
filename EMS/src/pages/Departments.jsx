import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [newDept, setNewDept] = useState('');
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/departments.php');
      if (res.data.success) {
        setDepartments(res.data.departments);
      } else {
        setError(res.data.message || 'Failed to fetch departments');
      }
    } catch (e) {
      setError('Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!newDept.trim()) return;
    try {
      const res = await axios.post('http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/departments.php', { name: newDept });
      if (res.data.success) {
        setSuccess('Department added!');
        setNewDept('');
        fetchDepartments();
      } else {
        setError(res.data.message || 'Failed to add department');
      }
    } catch (e) {
      setError('Failed to add department');
    }
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditName(name);
    setError('');
    setSuccess('');
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');
    if (!editName.trim()) return;
    try {
      const res = await axios.put('http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/departments.php', { id, name: editName });
      if (res.data.success) {
        setSuccess('Department updated!');
        setEditId(null);
        setEditName('');
        fetchDepartments();
      } else {
        setError(res.data.message || 'Failed to update department');
      }
    } catch (e) {
      setError('Failed to update department');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this department?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await axios.delete(`http://localhost/FINAL%20PROJECT/EMS_BACKEND/api/departments.php?id=${id}`);
      if (res.data.success) {
        setSuccess('Department deleted!');
        fetchDepartments();
      } else {
        setError(res.data.message || 'Failed to delete department');
      }
    } catch (e) {
      setError('Failed to delete department');
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <video autoPlay loop muted playsInline className="fixed top-0 left-0 w-full h-full object-cover z-0">
        <source src="/bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-400/30 to-white/80 z-10"></div>
      <div className="relative z-20 p-4 sm:p-8 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto bg-white/90 rounded-2xl shadow-2xl p-4 sm:p-8 backdrop-blur-md">
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-blue-900 mb-6 tracking-wide drop-shadow">Departments</h1>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
          {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}
          <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              placeholder="Add new department..."
              value={newDept}
              onChange={e => setNewDept(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">Add</button>
          </form>
          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <table className="min-w-full bg-white border border-gray-200 text-sm sm:text-base rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">ID</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Name</th>
                  <th className="py-3 px-4 border-b font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="hover:bg-blue-50 transition-colors border-b last:border-b-0">
                    <td className="py-2 px-4">{dept.id}</td>
                    <td className="py-2 px-4">
                      {editId === dept.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={e => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        dept.name
                      )}
                    </td>
                    <td className="py-2 px-4 flex gap-2">
                      {editId === dept.id ? (
                        <>
                          <button onClick={() => handleUpdate(dept.id)} className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition">Save</button>
                          <button onClick={() => { setEditId(null); setEditName(''); }} className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500 transition">Cancel</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEdit(dept.id, dept.name)} className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition">Edit</button>
                          <button onClick={() => handleDelete(dept.id)} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition">Delete</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Departments;
