import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/auth/AuthProvider';
import { getProviderBookings } from '../../services/bookingService';

// ✅ NEW: Import our design system components
import {
  PageLayout,
  PageHeader,
  ContentSection,
  StatsLayout,
} from '../../components/layout';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Icon,
  Heading,
  Text,
  Alert,
  LoadingState,
} from '../../components/ui';

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
        if (userProfile && userProfile.uid) {
          const bookings = await getProviderBookings(userProfile.uid);
          
          const completedBookings = bookings.filter(booking => booking.status === 'completed');
          const totalEarnings = completedBookings.reduce((total, booking) => total + (booking.price || 0), 0);
          
          const now = new Date();
          const currentMonth = now.getMonth();
          const currentYear = now.getFullYear();
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
          
          const thisMonthEarnings = completedBookings
            .filter(booking => {
              const bookingDate = new Date(booking.date);
              return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
            })
            .reduce((total, booking) => total + (booking.price || 0), 0);
          
          const lastMonthEarnings = completedBookings
            .filter(booking => {
              const bookingDate = new Date(booking.date);
              return bookingDate.getMonth() === lastMonth && bookingDate.getFullYear() === lastMonthYear;
            })
            .reduce((total, booking) => total + (booking.price || 0), 0);
          
          setEarnings({
            total: totalEarnings,
            thisMonth: thisMonthEarnings,
            lastMonth: lastMonthEarnings,
            completedBookings: completedBookings.length,
            pendingPayouts: 0
          });
          
          const formattedTransactions = completedBookings.map(booking => ({
            id: booking._id,
            date: booking.date,
            customerName: booking.userName || 'Customer',
            service: booking.serviceName,
            amount: booking.price || 0,
            status: 'completed',
            payoutStatus: 'paid'
          }));
          
          formattedTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
          setTransactions(formattedTransactions);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching earnings data:', error);
        setLoading(false);
      }
    };
    
    fetchEarningsData();
  }, [userProfile]);

  // Helper functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const calculateGrowth = () => {
    if (earnings.lastMonth === 0) return earnings.thisMonth > 0 ? '+100%' : '0%';
    const growth = ((earnings.thisMonth - earnings.lastMonth) / earnings.lastMonth) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'paid') return transaction.payoutStatus === 'paid';
    if (activeTab === 'pending') return transaction.payoutStatus === 'pending';
    return true;
  });

  // ✅ NEW: Enhanced StatCard component
  const StatCard = ({ title, value, subtitle, trend, icon, variant = 'default' }) => (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Text size="small" className="text-neutral-600 font-medium mb-2">
              {title}
            </Text>
            <Heading level={2} className="text-neutral-900 mb-1">
              {value}
            </Heading>
            {subtitle && (
              <Text size="small" className="text-neutral-500">
                {subtitle}
              </Text>
            )}
            {trend && (
              <div className="flex items-center mt-2">
                <Icon 
                  name={trend.includes('+') ? 'trendingUp' : 'trendingDown'} 
                  size="xs" 
                  className={`mr-1 ${trend.includes('+') ? 'text-success-600' : 'text-error-600'}`} 
                />
                <Text 
                  size="small" 
                  className={`font-medium ${trend.includes('+') ? 'text-success-600' : 'text-error-600'}`}
                >
                  {trend}
                </Text>
                <Text size="small" className="text-neutral-500 ml-1">
                  vs last month
                </Text>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${variant === 'primary' ? 'bg-primary-100' : 'bg-neutral-100'}`}>
            <Icon 
              name={icon} 
              size="lg" 
              className={variant === 'primary' ? 'text-primary-600' : 'text-neutral-600'} 
            />
      </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced TransactionRow component
  const TransactionRow = ({ transaction }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <Icon name="dollar" size="sm" className="text-primary-600" />
            </div>
            <div>
              <Heading level={4} className="text-neutral-900">
                {transaction.customerName}
              </Heading>
              <Text size="small" className="text-neutral-600">
                {transaction.service}
              </Text>
        </div>
      </div>
      
          <div className="flex items-center space-x-6">
            <div className="text-right">
              <Text size="small" className="text-neutral-600">
                {formatDate(transaction.date)}
              </Text>
            </div>
            <div className="text-right">
              <Heading level={4} className="text-neutral-900">
                {formatCurrency(transaction.amount)}
              </Heading>
            </div>
            <Badge 
              variant={transaction.payoutStatus === 'paid' ? 'success' : 'warning'}
              size="sm"
            >
              {transaction.payoutStatus === 'paid' ? 'Paid' : 'Pending'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // ✅ NEW: Enhanced Tab component
  const Tab = ({ label, isActive, onClick, count }) => (
    <button
      onClick={onClick}
      className={`px-6 py-3 border-b-2 text-sm font-medium transition-colors duration-150 ${
        isActive
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
      }`}
    >
      {label}
      {count !== undefined && (
        <Badge 
          variant={isActive ? 'primary' : 'neutral'} 
          size="sm" 
          className="ml-2"
        >
          {count}
        </Badge>
      )}
    </button>
  );

  // ✅ NEW: Enhanced Empty State
  const emptyState = (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon name="dollar" className="w-8 h-8 text-neutral-400" />
      </div>
      <Heading level={3} className="text-neutral-900 mb-2">No transactions found</Heading>
      <Text className="text-neutral-600">
        {activeTab === 'all' 
          ? "You haven't completed any bookings yet."
          : `No ${activeTab} transactions found.`
        }
      </Text>
          </div>
  );

  return (
    <PageLayout background="bg-neutral-50">
      <PageHeader
        title="Earnings Dashboard"
        subtitle="Track your financial performance"
        description="Monitor your earnings, view transaction history, and track payout status"
        icon={<Icon name="trending" />}
        breadcrumbs={[
          { label: 'Dashboard', href: '/provider/dashboard' },
          { label: 'Earnings' }
        ]}
        actions={[
          {
            label: 'Export Report',
            variant: 'outline',
            onClick: () => console.log('Export report'),
            icon: <Icon name="download" size="sm" />
          }
        ]}
      />

      <ContentSection>
        {loading ? (
          <LoadingState 
            title="Loading earnings data..."
            description="Calculating your financial metrics"
          />
        ) : (
          <>
            {/* Stats Section */}
            <StatsLayout className="mb-8">
              <StatCard
                title="Total Earnings"
                value={formatCurrency(earnings.total)}
                subtitle={`${earnings.completedBookings} completed bookings`}
                icon="dollar"
                variant="primary"
              />
              <StatCard
                title="This Month"
                value={formatCurrency(earnings.thisMonth)}
                trend={calculateGrowth()}
                icon="trending"
              />
              <StatCard
                title="Last Month"
                value={formatCurrency(earnings.lastMonth)}
                subtitle="Previous period"
                icon="calendar"
              />
              <StatCard
                title="Pending Payouts"
                value={formatCurrency(earnings.pendingPayouts)}
                subtitle="Will be processed soon"
                icon="clock"
              />
            </StatsLayout>

            {/* Transaction History */}
            <Card>
              <CardHeader className="border-b border-neutral-200">
                <CardTitle>Transaction History</CardTitle>
              </CardHeader>
          
          {/* Tabs */}
              <div className="border-b border-neutral-200">
            <nav className="flex -mb-px">
                  <Tab
                    label="All Transactions"
                    isActive={activeTab === 'all'}
                onClick={() => setActiveTab('all')}
                    count={transactions.length}
                  />
                  <Tab
                    label="Paid"
                    isActive={activeTab === 'paid'}
                onClick={() => setActiveTab('paid')}
                    count={transactions.filter(t => t.payoutStatus === 'paid').length}
                  />
                  <Tab
                    label="Pending"
                    isActive={activeTab === 'pending'}
                onClick={() => setActiveTab('pending')}
                    count={transactions.filter(t => t.payoutStatus === 'pending').length}
                  />
            </nav>
          </div>
          
              <CardContent className="p-6">
                {filteredTransactions.length > 0 ? (
                  <div className="space-y-0">
                    {filteredTransactions.map((transaction) => (
                      <TransactionRow
                        key={transaction.id}
                        transaction={transaction}
                      />
                    ))}
                  </div>
                ) : (
                  emptyState
                )}
              </CardContent>
            </Card>

            {/* Integration Notice */}
            <Alert variant="info" className="mt-8">
              <Icon name="info" size="sm" className="mr-2" />
              <div>
                <Text className="font-medium">Coming Soon: Direct Payouts</Text>
                <Text size="small" className="text-neutral-600 mt-1">
                  We're integrating Stripe for faster and more secure payments directly to your bank account.
                </Text>
        </div>
            </Alert>
          </>
        )}
      </ContentSection>
    </PageLayout>
  );
};

export default ProviderEarnings;
