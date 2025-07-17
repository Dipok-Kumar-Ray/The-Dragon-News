import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  FaChartBar, 
  FaChartPie, 
  FaChartLine,
  FaCalendarAlt,
  FaWeight,
  FaBoxOpen,
  FaHandHolding,
  FaCheckCircle,
  FaDownload,
  FaRefresh
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Custom Hooks
import { useAuth } from '../../hooks/useAuth';
import { useDonations } from '../../hooks/useDonations';

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const DonationStatistics = () => {
  const { user } = useAuth();
  const { getDonationStats } = useDonations();

  // States
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChart, setSelectedChart] = useState('bar');
  const [timeRange, setTimeRange] = useState('month'); // week, month, quarter, year

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError(null);

      const statsData = await getDonationStats({ 
        timeRange,
        restaurantId: user?.role === 'restaurant' ? user._id : undefined 
      });
      
      setStats(statsData);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError('পরিসংখ্যান লোড করতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  // Chart types
  const chartTypes = [
    { value: 'bar', label: 'বার চার্ট', icon: FaChartBar },
    { value: 'pie', label: 'পাই চার্ট', icon: FaChartPie },
    { value: 'line', label: 'লাইন চার্ট', icon: FaChartLine }
  ];

  // Time range options
  const timeRanges = [
    { value: 'week', label: 'সাপ্তাহিক' },
    { value: 'month', label: 'মাসিক' },
    { value: 'quarter', label: 'ত্রৈমাসিক' },
    { value: 'year', label: 'বার্ষিক' }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-gray-800 font-medium">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value} {entry.unit || 'টি'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Download statistics
  const downloadStats = () => {
    if (!stats) return;
    
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `donation-stats-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('পরিসংখ্যান ডাউনলোড হয়েছে');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading loading-spinner loading-lg text-primary"></div>
            <p className="mt-4 text-gray-600">পরিসংখ্যান লোড হচ্ছে...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="text-error text-4xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            পরিসংখ্যান লোড করতে সমস্যা
          </h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button onClick={loadStatistics} className="btn btn-primary">
            <FaRefresh className="mr-2" />
            আবার চেষ্টা করুন
          </button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="text-center py-12">
          <FaChartBar className="text-6xl text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            কোনো ডেটা পাওয়া যায়নি
          </h3>
          <p className="text-gray-500">এই সময়ের জন্য কোনো পরিসংখ্যান নেই</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ডোনেশন পরিসংখ্যান
            </h2>
            <p className="text-gray-600">
              আপনার খাদ্য দানের বিস্তারিত পরিসংখ্যান
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 lg:mt-0">
            {/* Time Range Selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="select select-bordered"
            >
              {timeRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>

            {/* Download Button */}
            <button
              onClick={downloadStats}
              className="btn btn-outline btn-primary"
            >
              <FaDownload className="mr-2" />
              ডাউনলোড
            </button>

            {/* Refresh Button */}
            <button
              onClick={loadStatistics}
              className="btn btn-outline"
            >
              <FaRefresh />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="stat bg-white shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <FaBoxOpen className="text-3xl" />
          </div>
          <div className="stat-title">মোট ডোনেশন</div>
          <div className="stat-value text-primary">{stats.summary?.total || 0}</div>
          <div className="stat-desc">সর্বমোট দান করেছেন</div>
        </div>

        <div className="stat bg-white shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <FaCheckCircle className="text-3xl" />
          </div>
          <div className="stat-title">সম্পন্ন ডোনেশন</div>
          <div className="stat-value text-success">{stats.summary?.completed || 0}</div>
          <div className="stat-desc">সফলভাবে সম্পন্ন</div>
        </div>

        <div className="stat bg-white shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <FaWeight className="text-3xl" />
          </div>
          <div className="stat-title">মোট পরিমাণ</div>
          <div className="stat-value text-warning">{stats.summary?.totalQuantity || 0}</div>
          <div className="stat-desc">কেজি খাবার দান</div>
        </div>

        <div className="stat bg-white shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <FaHandHolding className="text-3xl" />
          </div>
          <div className="stat-title">রিকুয়েস্ট</div>
          <div className="stat-value text-info">{stats.summary?.requests || 0}</div>
          <div className="stat-desc">মোট রিকুয়েস্ট পেয়েছেন</div>
        </div>
      </motion.div>

      {/* Chart Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-lg p-6"
      >
        <div className="flex flex-wrap gap-2 mb-6">
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.value}
                onClick={() => setSelectedChart(type.value)}
                className={`btn btn-sm ${
                  selectedChart === type.value ? 'btn-primary' : 'btn-outline'
                }`}
              >
                <IconComponent className="mr-2" />
                {type.label}
              </button>
            );
          })}
        </div>

        {/* Charts */}
        <div className="h-96">
          {selectedChart === 'bar' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.chartData?.monthly || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="donations" fill="#8884d8" name="ডোনেশন" />
                <Bar dataKey="quantity" fill="#82ca9d" name="পরিমাণ (কেজি)" />
              </BarChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'pie' && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.chartData?.byType || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats.chartData?.byType || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}

          {selectedChart === 'line' && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.chartData?.daily || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="donations" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="দৈনিক ডোনেশন"
                />
                <Line 
                  type="monotone" 
                  dataKey="requests" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="দৈনিক রিকুয়েস্ট"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      {/* Detailed Tables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Top Food Types */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            জনপ্রিয় খাবারের ধরন
          </h3>
          <div className="space-y-3">
            {(stats.topFoodTypes || []).map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-gray-700">{item.type}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${(item.count / stats.summary.total) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            সাম্প্রতিক কার্যকলাপ
          </h3>
          <div className="space-y-3">
            {(stats.recentActivity || []).map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{activity.description}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleDateString('bn-BD')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DonationStatistics;