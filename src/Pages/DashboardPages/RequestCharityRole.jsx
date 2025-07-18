import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../provider/AuthProvider';
import { FaCreditCard, FaBuilding, FaUser, FaEnvelope, FaMission } from 'react-icons/fa';

const RequestCharityRole = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    organizationName: '',
    missionStatement: ''
  });
  const [loading, setLoading] = useState(false);
  const [hasExistingRequest, setHasExistingRequest] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);

  const PAYMENT_AMOUNT = 25; // Fixed amount in USD

  useEffect(() => {
    // Check if user already has a pending or approved request
    checkExistingRequest();
  }, [user]);

  const checkExistingRequest = () => {
    // Simulate checking existing request from localStorage
    const existingRequests = JSON.parse(localStorage.getItem('charityRequests') || '[]');
    const userRequest = existingRequests.find(req => req.userEmail === user?.email);
    
    if (userRequest && (userRequest.status === 'Pending' || userRequest.status === 'Approved')) {
      setHasExistingRequest(true);
      setExistingRequest(userRequest);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePayment = async () => {
    if (!formData.organizationName.trim() || !formData.missionStatement.trim()) {
      alert('Please fill in all required fields before proceeding with payment.');
      return;
    }

    setLoading(true);

    try {
      // Simulate Stripe payment process
      const paymentResult = await simulateStripePayment();
      
      if (paymentResult.success) {
        // Save the role request to "database" (localStorage)
        const newRequest = {
          id: Date.now().toString(),
          userEmail: user.email,
          userName: user.displayName || user.email,
          organizationName: formData.organizationName,
          missionStatement: formData.missionStatement,
          transactionId: paymentResult.transactionId,
          amount: PAYMENT_AMOUNT,
          status: 'Pending',
          requestDate: new Date().toISOString(),
          purpose: 'Charity Role Request'
        };

        // Save to requests
        const existingRequests = JSON.parse(localStorage.getItem('charityRequests') || '[]');
        existingRequests.push(newRequest);
        localStorage.setItem('charityRequests', JSON.stringify(existingRequests));

        // Save transaction history
        const existingTransactions = JSON.parse(localStorage.getItem('userTransactions') || '[]');
        const userTransactions = existingTransactions.filter(t => t.userEmail === user.email);
        userTransactions.push({
          id: Date.now().toString(),
          userEmail: user.email,
          transactionId: paymentResult.transactionId,
          amount: PAYMENT_AMOUNT,
          date: new Date().toISOString(),
          purpose: 'Charity Role Request',
          status: 'Completed'
        });
        
        // Update transactions for this user
        const otherTransactions = existingTransactions.filter(t => t.userEmail !== user.email);
        localStorage.setItem('userTransactions', JSON.stringify([...otherTransactions, ...userTransactions]));

        alert('Payment successful! Your charity role request has been submitted for admin approval.');
        
        // Reset form and update state
        setFormData({ organizationName: '', missionStatement: '' });
        setHasExistingRequest(true);
        setExistingRequest(newRequest);
      } else {
        alert(`Payment failed: ${paymentResult.error}`);
      }
    } catch (error) {
      alert(`Payment error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const simulateStripePayment = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate 90% success rate
        const success = Math.random() > 0.1;
        if (success) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
          });
        } else {
          resolve({
            success: false,
            error: 'Card declined. Please try a different payment method.'
          });
        }
      }, 2000); // Simulate network delay
    });
  };

  if (hasExistingRequest) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Request Charity Role</h1>
          <p className="text-gray-600 mt-1">Your charity role request status</p>
        </div>

        <div className="max-w-2xl">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FaBuilding className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-blue-900">
                  Existing Request Found
                </h3>
                <p className="text-blue-700 mt-1">
                  You already have a charity role request with status: 
                  <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                    existingRequest?.status === 'Pending' 
                      ? 'bg-yellow-100 text-yellow-800'
                      : existingRequest?.status === 'Approved'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {existingRequest?.status}
                  </span>
                </p>
              </div>
            </div>

            <div className="mt-4 border-t border-blue-200 pt-4">
              <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-blue-900">Organization Name</dt>
                  <dd className="text-sm text-blue-700 mt-1">{existingRequest?.organizationName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-blue-900">Request Date</dt>
                  <dd className="text-sm text-blue-700 mt-1">
                    {new Date(existingRequest?.requestDate).toLocaleDateString()}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-blue-900">Mission Statement</dt>
                  <dd className="text-sm text-blue-700 mt-1">{existingRequest?.missionStatement}</dd>
                </div>
              </dl>
            </div>

            {existingRequest?.status === 'Pending' && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Your request is pending admin approval. 
                  You will be notified once a decision is made.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Request Charity Role</h1>
        <p className="text-gray-600 mt-1">Submit your application to become a charity organization</p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
          {/* User Information (readonly) */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaUser className="inline h-4 w-4 mr-2" />
                  User Name
                </label>
                <input
                  type="text"
                  value={user?.displayName || user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaEnvelope className="inline h-4 w-4 mr-2" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* Organization Information */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Organization Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaBuilding className="inline h-4 w-4 mr-2" />
                  Organization Name *
                </label>
                <input
                  type="text"
                  name="organizationName"
                  value={formData.organizationName}
                  onChange={handleInputChange}
                  placeholder="Enter your organization name"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <FaMission className="inline h-4 w-4 mr-2" />
                  Mission Statement *
                </label>
                <textarea
                  name="missionStatement"
                  value={formData.missionStatement}
                  onChange={handleInputChange}
                  placeholder="Describe your organization's mission and goals..."
                  rows={4}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  <FaCreditCard className="inline h-4 w-4 mr-2" />
                  Application Fee
                </p>
                <p className="text-2xl font-bold text-green-600">${PAYMENT_AMOUNT}</p>
                <p className="text-xs text-gray-500 mt-1">
                  One-time payment to process your charity role application
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">Secure payment via</div>
                <div className="text-lg font-bold text-blue-600">Stripe</div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handlePayment}
              disabled={loading || !formData.organizationName.trim() || !formData.missionStatement.trim()}
              className={`w-full py-3 px-4 rounded-md font-medium text-white transition-colors ${
                loading || !formData.organizationName.trim() || !formData.missionStatement.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  <FaCreditCard className="mr-2 h-5 w-5" />
                  Pay ${PAYMENT_AMOUNT} & Submit Application
                </span>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            By submitting this application, you agree to our terms and conditions. 
            Your payment will be processed securely through Stripe.
          </div>
        </form>
      </div>
    </div>
  );
};

export default RequestCharityRole;