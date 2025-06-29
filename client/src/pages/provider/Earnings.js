import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { motion } from 'framer-motion';

const ProviderEarnings = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [earnings, setEarnings] = useState({
    total: 0,
    thisMonth: 0,
    lastMonth: 0,
    completedBookings: 0,
    pendingPayouts: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchEarningsData = async () => {
      setLoading(true);
      try {
        // This would be replaced with real API calls in a production app
        // Mock data for demonstration
        setTimeout(() => {
          setEarnings({
            total: 3450.75,
            thisMonth: 850.25,
            lastMonth: 1200.50,
            completedBookings: 28,
            pendingPayouts: 250.00
          });
          
          // Generate mock transaction history
          const mockTransactions = [
            {
              id: 'tr1',
              date: '2025-05-01',
              customerName: 'Moshe Levi',
              service: 'Plumbing Repair',
              amount: 350.00,
              status: 'completed',
              payoutStatus: 'paid'
            },
            {
              id: 'tr2',
              date: '2025-04-28',
              customerName: 'Noor Abu-Hani',
              service: 'Pipe Installation',
              amount: 550.00,
              status: 'completed',
              payoutStatus: 'paid'
            },
            {
              id: 'tr3',
              date: '2025-04-25',
              customerName: 'Yael Goldstein',
              service: 'Drain Cleaning',
              amount: 400.00,
              status: 'completed',
              payoutStatus: 'paid'
            },
            {
              id: 'tr4',
              date: '2025-05-03',
              customerName: 'Ahmad Masarweh',
              service: 'Faucet Replacement',
              amount: 450.00,
              status: 'completed',
              payoutStatus: 'pending'
            },
            {
              id: 'tr5',
              date: '2025-05-04',
              customerName: 'Rachel Berkovich',
              service: 'Toilet Repair',
              amount: 300.00,
              status: 'completed',
              payoutStatus: 'pending'
            },
            {
              id: 'tr6',
              date: '2025-03-15',
              customerName: 'Mahmoud Jabarin',
              service: 'Shower Installation',
              amount: 800.00,
              status: 'completed',
              payoutStatus: 'paid'
            }
          ];
          
          setTransactions(mockTransactions);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setLoading(false);
      }
    };
    
    fetchEarningsData();
  }, []);

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return transaction.payoutStatus === 'paid';
    if (activeTab === 'pending') return transaction.payoutStatus === 'pending';
    return true;
  });

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary-600 text-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold">Earnings Dashboard</h1>
          <p className="mt-1 text-primary-100">Track your earnings and payouts</p>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-sm font-medium text-gray-500">Total Earnings</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(earnings.total)}</p>
            <p className="mt-1 text-sm text-gray-500">{earnings.completedBookings} completed bookings</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <h3 className="text-sm font-medium text-gray-500">This Month</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(earnings.thisMonth)}</p>
            <p className="mt-1 text-sm text-green-600">
              <span className="font-medium">↑ 12%</span>
              <span className="ml-1">vs last month</span>
            </p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <h3 className="text-sm font-medium text-gray-500">Last Month</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(earnings.lastMonth)}</p>
            <p className="mt-1 text-sm text-gray-500">April 2025</p>
          </motion.div>
          
          <motion.div 
            className="bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h3 className="text-sm font-medium text-gray-500">Pending Payouts</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{formatCurrency(earnings.pendingPayouts)}</p>
            <p className="mt-1 text-sm text-gray-500">Will be processed soon</p>
          </motion.div>
        </div>
        
        {/* Transaction History */}
        <motion.div 
          className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Transaction History</h2>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-100">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'all'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                All Transactions
              </button>
              <button
                onClick={() => setActiveTab('paid')}
                className={`px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'paid'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Paid
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-6 py-3 border-b-2 text-sm font-medium ${
                  activeTab === 'pending'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Pending
              </button>
            </nav>
          </div>
          
          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((transaction) => (
                    <tr key={transaction.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.date)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{transaction.customerName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(transaction.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.payoutStatus === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {transaction.payoutStatus === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-sm text-gray-500">
                      No transactions found for the selected filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
        
        {/* Export Options */}
        <div className="mt-8 flex justify-end">
          <button
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export Report
          </button>
        </div>
        
        {/* Future Stripe Integration Notice */}
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Coming Soon:</strong> Direct payouts via Stripe. We're working on integrating Stripe for faster and more secure payments directly to your bank account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProviderEarnings;
