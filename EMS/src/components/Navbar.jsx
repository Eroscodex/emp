import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        onLogout();
        navigate('/login');
    };

    return (
        <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200 fixed w-full top-0 z-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-xl font-bold text-blue-600">
                            EMPLOYEE MANAGEMENT SYSTEM PORTAL
                        </Link>
                    </div>

                    {user && (
                        <div className="hidden md:flex items-center justify-end flex-1 space-x-4">
                            <div className="flex items-center space-x-2">
                                <Link to="/" 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive('/') 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    Dashboard
                                </Link>
                                <Link to="/employees" 
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        isActive('/employees') 
                                            ? 'bg-blue-50 text-blue-600' 
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}>
                                    Employees
                                </Link>
                                {user.role === 'admin' && (
                                    <>
                                        <Link to="/add-employee" 
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isActive('/add-employee') 
                                                    ? 'bg-blue-50 text-blue-600' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}>
                                            Add Employee
                                        </Link>
                                        <Link to="/departments" 
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                isActive('/departments') 
                                                    ? 'bg-blue-50 text-blue-600' 
                                                    : 'text-gray-600 hover:bg-gray-50'
                                            }`}>
                                            Departments
                                        </Link>
                                    </>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center space-x-3 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <img
                                        className="h-8 w-8 rounded-lg border-2 border-gray-200"
                                        src={`https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`}
                                        alt=""
                                    />
                                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white shadow-lg border border-gray-100">
                                        <div className="p-2 space-y-1">
                                            <Link to="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-50">
                                                Profile Settings
                                            </Link>
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center px-4 py-2 text-sm text-red-600 rounded-lg hover:bg-red-50"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md hover:bg-gray-50"
                        >
                            <span className="sr-only">Open main menu</span>
                            <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {isMenuOpen && (
                <div className="md:hidden bg-white border-t border-gray-100">
                    <div className="px-2 pt-2 pb-3 space-y-1">
                        <Link to="/" className="block px-4 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50">
                            Dashboard
                        </Link>
                        <Link to="/employees" className="block px-4 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50">
                            Employees
                        </Link>
                        {user?.role === 'admin' && (
                            <>
                                <Link to="/add-employee" className="block px-4 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50">
                                    Add Employee
                                </Link>
                                <Link to="/departments" className="block px-4 py-2 rounded-lg text-base font-medium text-gray-600 hover:bg-gray-50">
                                    Departments
                                </Link>
                            </>
                        )}
                        <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;