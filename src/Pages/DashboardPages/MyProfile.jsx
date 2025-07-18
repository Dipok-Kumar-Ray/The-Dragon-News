import React, { useContext } from 'react';
import { AuthContext } from '../../provider/AuthProvider';
import { FaUser, FaEnvelope, FaCalendar, FaShield } from 'react-icons/fa';

const MyProfile = () => {
  const { user } = useContext(AuthContext);

  // Get user role from localStorage or state management
  const getUserRole = () => {
    return localStorage.getItem('userRole') || 'User';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not available';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-1">View and manage your personal information</p>
      </div>

      <div className="space-y-6">
        {/* Profile Picture and Basic Info */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {user?.photoURL ? (
                <img
                  className="h-20 w-20 rounded-full border-4 border-white shadow-lg"
                  src={user.photoURL}
                  alt="Profile"
                />
              ) : (
                <div className="h-20 w-20 rounded-full border-4 border-white bg-white flex items-center justify-center">
                  <FaUser className="h-8 w-8 text-gray-400" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {user?.displayName || 'User'}
              </h2>
              <p className="text-blue-100 mt-1">
                {user?.email}
              </p>
              <div className="flex items-center mt-2">
                <FaShield className="h-4 w-4 mr-2" />
                <span className="text-sm">Role: {getUserRole()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Personal Information
            </h3>
            <div className="space-y-4">
              <div className="flex items-center">
                <FaUser className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Display Name</p>
                  <p className="font-medium text-gray-900">
                    {user?.displayName || 'Not set'}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FaEnvelope className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Email Address</p>
                  <p className="font-medium text-gray-900">
                    {user?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <FaCalendar className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Account Created</p>
                  <p className="font-medium text-gray-900">
                    {formatDate(user?.metadata?.creationTime)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account Status */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Account Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Verified</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user?.emailVerified 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user?.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Account Status</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Current Role</span>
                <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {getUserRole()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Sign In</span>
                <span className="text-sm text-gray-900">
                  {formatDate(user?.metadata?.lastSignInTime)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Activity Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-gray-600">Saved Favorites</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Reviews Written</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-gray-600">Transactions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {getUserRole() === 'Charity' ? '1' : '0'}
              </div>
              <div className="text-sm text-gray-600">Role Requests</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Edit Profile
          </button>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors">
            Change Password
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;