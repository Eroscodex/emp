import React from 'react';
import { Link } from 'react-router-dom';

const NoPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-blue-600">404</h1>
        <h2 className="text-6xl font-medium text-gray-600 mb-4">Page Not Found</h2>
        <p className="text-xl text-gray-500 mb-8">Sorry, we couldn't find the page you're looking for.</p>
        <Link 
          to="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NoPage;