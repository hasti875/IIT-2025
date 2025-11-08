import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Clock, Activity, CheckCircle } from 'lucide-react';
import { dashboardService } from '../services';
import RoleBasedLayout from '../components/RoleBasedLayout';
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
  Line
} from 'recharts';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('project-performance');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await dashboardService.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Prepare chart data from analytics
  const getProjectFinancialData = () => {
    if (!analytics?.projectFinancials) return [];
    return analytics.projectFinancials.map(project => ({
      name: project.name.length > 15 ? project.name.substring(0, 15) + '...' : project.name,
      Cost: Math.round(project.cost),
      Revenue: Math.round(project.revenue),
      Profit: Math.round(project.profit)
    }));
  };

  const getTaskDistributionData = () => {
    if (!analytics?.summary) return [];
    const { tasksDone, tasksInProgress, tasksNew, tasksBlocked } = analytics.summary;
    return [
      { name: 'Done', value: tasksDone || 0, color: '#10b981' },
      { name: 'In Progress', value: tasksInProgress || 0, color: '#3b82f6' },
      { name: 'New', value: tasksNew || 0, color: '#f59e0b' },
      { name: 'Blocked', value: tasksBlocked || 0, color: '#ef4444' }
    ];
  };

  const getHoursData = () => {
    if (!analytics?.summary) return [];
    const { billableHours, nonBillableHours } = analytics.summary;
    return [
      { name: 'Billable', value: billableHours || 0, color: '#10b981' },
      { name: 'Non-Billable', value: nonBillableHours || 0, color: '#6b7280' }
    ];
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: Rs. {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-semibold text-gray-900">{payload[0].name}</p>
          <p className="text-sm text-gray-600">{payload[0].value} items</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !analytics) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading analytics...</div>
        </div>
      </RoleBasedLayout>
    );
  }

  const { summary } = analytics;
  const totalRevenue = summary?.totalRevenue || 0;
  const totalCost = summary?.totalCost || 0;
  const totalProfit = summary?.totalProfit || 0;
  const activeProjects = summary?.activeProjects || 0;
  const billableHours = summary?.billableHours || 0;
  const hoursLogged = summary?.hoursLogged || 0;
  const utilizationRate = hoursLogged > 0 ? Math.round((billableHours / hoursLogged) * 100) : 0;

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
              Rs. {Math.round(totalRevenue).toLocaleString()}
            </p>
            <p className="text-xs text-green-600 mt-2">Current Month</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Total Profit</p>
            <p className="text-2xl font-bold text-gray-900">
              Rs. {Math.round(totalProfit).toLocaleString()}
            </p>
            <p className={`text-xs mt-2 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {totalProfit >= 0 ? '+' : ''}{totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}% margin
            </p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Activity className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Active Projects</p>
            <p className="text-2xl font-bold text-gray-900">{activeProjects}</p>
            <p className="text-xs text-gray-500 mt-2">{summary?.totalProjects || 0} total projects</p>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <Clock className="text-yellow-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Billable Hours</p>
            <p className="text-2xl font-bold text-gray-900">
              {billableHours.toLocaleString()}h
            </p>
            <p className="text-xs text-green-600 mt-2">{utilizationRate}% utilization</p>
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
            {activeTab === 'project-performance' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Project Financial Performance</h2>
                
                {getProjectFinancialData().length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart
                      data={getProjectFinancialData()}
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
                        tickFormatter={(value) => `${value >= 1000 ? (value / 1000) + 'k' : value}`}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="square"
                      />
                      <Bar 
                        dataKey="Cost" 
                        fill="#ef4444" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                      <Bar 
                        dataKey="Revenue" 
                        fill="#3b82f6" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                      <Bar 
                        dataKey="Profit" 
                        fill="#10b981" 
                        radius={[8, 8, 0, 0]}
                        maxBarSize={60}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    No project financial data available
                  </div>
                )}
              </>
            )}

            {activeTab === 'time-tracking' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Hours Distribution</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">Billable vs Non-Billable</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getHoursData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}h`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getHoursData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Hours Logged</span>
                        <span className="font-semibold text-gray-900">{hoursLogged}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Billable Hours</span>
                        <span className="font-semibold text-green-600">{billableHours}h</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Non-Billable Hours</span>
                        <span className="font-semibold text-gray-600">{summary?.nonBillableHours || 0}h</span>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t">
                        <span className="text-gray-600">Utilization Rate</span>
                        <span className="font-semibold text-blue-600">{utilizationRate}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'resource-allocation' && (
              <>
                <h2 className="text-lg font-semibold text-gray-900 mb-6">Task Distribution by Status</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getTaskDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {getTaskDistributionData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<PieTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Task Breakdown</h3>
                    <div className="space-y-3">
                      {getTaskDistributionData().map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-600">{item.name}</span>
                          </div>
                          <span className="font-semibold text-gray-900">{item.value}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-3 border-t">
                        <span className="text-gray-600 font-medium">Total Tasks</span>
                        <span className="font-semibold text-blue-600">{summary?.totalTasks || 0}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-green-600">
                          {summary?.totalTasks > 0 ? Math.round((summary.tasksDone / summary.totalTasks) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </RoleBasedLayout>
  );
};

export default Analytics;
