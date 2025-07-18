import React, { useContext } from 'react';
import { NavLink, Outlet } from 'react-router';
import { AuthContext } from '../provider/AuthProvider';
import { FaUser, FaHeart, FaStar, FaHistory, FaUserPlus } from 'react-icons/fa';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  🔒 User Dashboard
                </h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome back,</span>
              <span className="text-sm font-medium text-gray-900">
                {user?.displayName || user?.email}
              </span>
              {user?.photoURL && (
                <img
                  className="h-8 w-8 rounded-full"
                  src={user.photoURL}
                  alt="Profile"
                />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Dashboard Menu
                </h2>
                <nav className="space-y-2">
                  <NavLink
                    to="/dashboard/profile"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <FaUser className="mr-3 h-4 w-4" />
                    My Profile
                  </NavLink>

                  <NavLink
                    to="/dashboard/request-charity"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <FaUserPlus className="mr-3 h-4 w-4" />
                    Request Charity Role
                  </NavLink>

                  <NavLink
                    to="/dashboard/favorites"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <FaHeart className="mr-3 h-4 w-4" />
                    Favorites
                  </NavLink>

                  <NavLink
                    to="/dashboard/reviews"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <FaStar className="mr-3 h-4 w-4" />
                    My Reviews
                  </NavLink>

                  <NavLink
                    to="/dashboard/transactions"
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`
                    }
                  >
                    <FaHistory className="mr-3 h-4 w-4" />
                    Transaction History
                  </NavLink>
                </nav>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm border min-h-[600px]">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;