import React from 'react';
import { useEnhancedRouter } from '../utils/enhanced-router';

const NotFound: React.FC = () => {
  const { navigate } = useEnhancedRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* 404 Illustration */}
          <div className="mb-8">
            <svg
              className="mx-auto h-48 w-48 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          {/* Error Code */}
          <h1 className="text-6xl md:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            404
          </h1>

          {/* Error Message */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8 text-lg">
            Oops! The page you're looking for doesn't exist or has been moved.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('dashboard')}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
              Go to Dashboard
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Go Back
            </button>
          </div>

          {/* Additional Help */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-600 mb-4">
              Need help? Here are some helpful links:
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => navigate('students')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Students
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => navigate('staff')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Staff
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => navigate('admission')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Admissions
              </button>
              <span className="text-gray-400">•</span>
              <button
                onClick={() => navigate('settings')}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Settings
              </button>
            </div>
          </div>
        </div>

        {/* School Branding */}
        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 eSiddhiविद्यालय - School Management System
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;