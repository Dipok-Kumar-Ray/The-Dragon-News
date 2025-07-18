import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../provider/AuthProvider';
import { FaCreditCard, FaCalendar, FaCheck, FaClock, FaTimes, FaEye } from 'react-icons/fa';

const TransactionHistory = () => {
  const { user } = useContext(AuthContext);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, completed, pending, rejected

  useEffect(() => {
    loadTransactions();
  }, [user]);

  const loadTransactions = () => {
    setLoading(true);
    try {
      // Load transactions from localStorage
      const allTransactions = JSON.parse(localStorage.getItem('userTransactions') || '[]');
      const userTransactions = allTransactions.filter(transaction => transaction.userEmail === user?.email);
      
      // Load charity requests to get status information
      const charityRequests = JSON.parse(localStorage.getItem('charityRequests') || '[]');
      
      // Merge transaction data with request status
      const enrichedTransactions = userTransactions.map(transaction => {
        if (transaction.purpose === 'Charity Role Request') {
          const relatedRequest = charityRequests.find(req => 
            req.userEmail === user?.email && req.transactionId === transaction.transactionId
          );
          return {
            ...transaction,
            requestStatus: relatedRequest?.status || 'Unknown'
          };
        }
        return transaction;
      });
      
      setTransactions(enrichedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheck },
      'Pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: FaClock },
      'Approved': { bg: 'bg-green-100', text: 'text-green-800', icon: FaCheck },
      'Rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes },
      'Failed': { bg: 'bg-red-100', text: 'text-red-800', icon: FaTimes }
    };

    const config = statusConfig[status] || statusConfig['Completed'];
    const IconComponent = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="h-3 w-3 mr-1" />
        {status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    if (filter === 'completed') return transaction.status === 'Completed';
    if (filter === 'pending') return transaction.requestStatus === 'Pending';
    if (filter === 'approved') return transaction.requestStatus === 'Approved';
    if (filter === 'rejected') return transaction.requestStatus === 'Rejected';
    return true;
  });

  // Sample data generator for demonstration
  const generateSampleTransactions = () => {
    const sampleTransactions = [
      {
        id: '1',
        userEmail: user?.email,
        transactionId: 'txn_1701234567_abc123',
        amount: 25,
        date: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        purpose: 'Charity Role Request',
        status: 'Completed',
        requestStatus: 'Pending'
      },
      {
        id: '2',
        userEmail: user?.email,
        transactionId: 'txn_1701134567_def456',
        amount: 25,
        date: new Date(Date.now() - 1123200000).toISOString(), // 13 days ago
        purpose: 'Charity Role Request',
        status: 'Completed',
        requestStatus: 'Approved'
      },
      {
        id: '3',
        userEmail: user?.email,
        transactionId: 'txn_1700934567_ghi789',
        amount: 25,
        date: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        purpose: 'Charity Role Request',
        status: 'Completed',
        requestStatus: 'Rejected'
      }
    ];

    // Save to localStorage if no transactions exist
    const existingTransactions = JSON.parse(localStorage.getItem('userTransactions') || '[]');
    if (existingTransactions.length === 0) {
      localStorage.setItem('userTransactions', JSON.stringify(sampleTransactions));
      setTransactions(sampleTransactions);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading transaction history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Transaction History</h1>
            <p className="text-gray-600 mt-1">
              All your payment transactions for charity role requests
            </p>
          </div>
          {transactions.length === 0 && (
            <button
              onClick={generateSampleTransactions}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Sample Data
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        {transactions.length > 0 && (
          <div className="mt-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {[
                  { key: 'all', label: 'All Transactions' },
                  { key: 'completed', label: 'Completed' },
                  { key: 'pending', label: 'Pending' },
                  { key: 'approved', label: 'Approved' },
                  { key: 'rejected', label: 'Rejected' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      filter === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                    <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                      filter === tab.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.key === 'all' ? transactions.length : 
                       tab.key === 'completed' ? transactions.filter(t => t.status === 'Completed').length :
                       tab.key === 'pending' ? transactions.filter(t => t.requestStatus === 'Pending').length :
                       tab.key === 'approved' ? transactions.filter(t => t.requestStatus === 'Approved').length :
                       transactions.filter(t => t.requestStatus === 'Rejected').length}
                    </span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <FaCreditCard className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No transactions yet</h3>
          <p className="text-gray-600 mb-6">
            Your payment history for charity role requests will appear here.
          </p>
          <button
            onClick={() => window.location.href = '/dashboard/request-charity'}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Request Charity Role
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Request Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {transaction.purpose}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {transaction.transactionId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatAmount(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(transaction.date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(transaction.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {transaction.requestStatus && getStatusBadge(transaction.requestStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => alert(`Transaction details for ${transaction.transactionId}`)}
                        className="text-blue-600 hover:text-blue-900 flex items-center"
                      >
                        <FaEye className="h-4 w-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden">
            <div className="divide-y divide-gray-200">
              {filteredTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-medium text-gray-900">
                      {transaction.purpose}
                    </div>
                    <div className="text-sm font-semibold text-gray-900">
                      {formatAmount(transaction.amount)}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-2">
                    ID: {transaction.transactionId}
                  </div>
                  
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm text-gray-600">
                      {formatDate(transaction.date)}
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(transaction.status)}
                      {transaction.requestStatus && getStatusBadge(transaction.requestStatus)}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => alert(`Transaction details for ${transaction.transactionId}`)}
                    className="text-blue-600 hover:text-blue-900 text-sm flex items-center"
                  >
                    <FaEye className="h-4 w-4 mr-1" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {filteredTransactions.length > 0 && (
        <div className="mt-6">
          {/* Summary Stats */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {transactions.length}
                </div>
                <div className="text-sm text-gray-600">Total Transactions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatAmount(transactions.reduce((sum, t) => sum + t.amount, 0))}
                </div>
                <div className="text-sm text-gray-600">Total Amount Paid</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {transactions.filter(t => t.requestStatus === 'Pending').length}
                </div>
                <div className="text-sm text-gray-600">Pending Requests</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {transactions.filter(t => t.requestStatus === 'Approved').length}
                </div>
                <div className="text-sm text-gray-600">Approved Requests</div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;