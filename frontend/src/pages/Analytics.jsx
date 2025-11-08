import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Clock } from 'lucide-react';
import { dashboardService, projectService } from '../services';
import RoleBasedLayout from '../components/RoleBasedLayout';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('project-performance');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, projectsRes] = await Promise.all([
        dashboardService.getAnalytics(),
        projectService.getAll()
      ]);
      setAnalytics(analyticsRes.data);
      setProjects(projectsRes.data || []);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from projects
  const getChartData = () => {
    return projects.map(project => {
      const cost = parseFloat(project.budget || 0) * (1 - (parseFloat(project.progress || 0) / 100));
      const revenue = parseFloat(project.budget || 0);
      const profit = revenue - cost;
      
      return {
        name: project.name,
        Cost: Math.round(cost),
        Revenue: Math.round(revenue),
        Profit: Math.round(profit)
      };
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: ${entry.value.toLocaleString()}
            </p>
          ))}
          {payload.length >= 2 && (
            <p className="text-sm font-semibold text-gray-700 mt-1">
              Profit: ${(payload[1].value - payload[0].value).toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </RoleBasedLayout>
    );
  }

  const totalRevenue = projects.reduce((sum, p) => sum + parseFloat(p.budget || 0), 0);
  const totalCost = projects.reduce((sum, p) => {
    const cost = parseFloat(p.budget || 0) * (1 - (parseFloat(p.progress || 0) / 100));
    return sum + cost;
  }, 0);
  const activeResources = analytics?.activeProjects || projects.filter(p => p.status === 'Active').length;
  const billableHours = 3780; // This should come from timesheet data

  return (
    <RoleBasedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Track performance metrics and insights</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(totalRevenue).toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-2">+13.2%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-gray-900">
              ${Math.round(totalCost).toLocaleString()}
            </p>
            <p className="text-xs text-blue-600 mt-2">+12.5%</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Users className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Active Resources</p>
            <p className="text-2xl font-bold text-gray-900">{activeResources}</p>
            <p className="text-xs text-gray-500 mt-2">-5 this month</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Billable Hours</p>
            <p className="text-2xl font-bold text-gray-900">
              {billableHours.toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-2">83% utilization</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="border-b border-gray-100">
            <div className="flex gap-0">
              <button
                onClick={() => setActiveTab('project-performance')}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'project-performance'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Project Performance
              </button>
              <button
                onClick={() => setActiveTab('time-tracking')}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'time-tracking'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Time Tracking
              </button>
              <button
                onClick={() => setActiveTab('resource-allocation')}
                className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                  activeTab === 'resource-allocation'
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                Resource Allocation
              </button>
            </div>
          </div>

          {/* Chart Section */}
          <div className="p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Cost vs Revenue by Project</h2>
            
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={getChartData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis 
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                  axisLine={{ stroke: '#e5e7eb' }}
                  tickFormatter={(value) => `${value / 1000}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="Cost" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
                <Bar 
                  dataKey="Revenue" 
                  fill="#10b981" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
                <Bar 
                  dataKey="Profit" 
                  fill="#22c55e" 
                  radius={[8, 8, 0, 0]}
                  maxBarSize={80}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
};

export default Analytics;
