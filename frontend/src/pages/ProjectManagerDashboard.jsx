import { useEffect, useState } from 'react';
import { dashboardService, projectService, taskService, timesheetService, financeService } from '../services';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProjectManagerLayout from '../components/ProjectManagerLayout';
import { useCurrency } from '../context/CurrencyContext';

const ProjectManagerDashboard = () => {
  const { formatAmount, currencySymbol } = useCurrency();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [salesOrders, setSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, projectsRes, tasksRes, timesheetsRes, salesOrdersRes] = await Promise.all([
        dashboardService.getAnalytics().catch(() => ({ data: null })),
        projectService.getAll(),
        taskService.getAll().catch(() => ({ data: [] })),
        timesheetService.getTimesheets().catch(() => ({ data: [] })),
        financeService.getSalesOrders().catch(() => ({ data: [] }))
      ]);
      setAnalytics(analyticsRes.data);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
      setTimesheets(timesheetsRes.data || []);
      setSalesOrders(salesOrdersRes.data || []);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'in progress':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 75) {
      return 'from-blue-500 to-green-500';
    }
    return 'from-blue-500 to-cyan-500';
  };

  if (loading) {
    return (
      <ProjectManagerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </ProjectManagerLayout>
    );
  }

  // Calculate dynamic metrics
  const activeProjects = projects.filter(p => p.status === 'Active').length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  
  // Calculate total hours from timesheets (current month)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const totalHours = timesheets
    .filter(ts => {
      const tsDate = new Date(ts.date || ts.createdAt);
      return tsDate.getMonth() === currentMonth && tsDate.getFullYear() === currentYear;
    })
    .reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
  
  // Calculate revenue from sales orders
  const totalRevenue = salesOrders
    .filter(so => so.status === 'Approved' || so.status === 'Completed')
    .reduce((sum, so) => sum + parseFloat(so.totalAmount || 0), 0);
  
  // Calculate growth metrics
  const lastMonthProjects = projects.filter(p => {
    const createdDate = new Date(p.createdAt);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return createdDate.getMonth() === lastMonth.getMonth() && 
           createdDate.getFullYear() === lastMonth.getFullYear();
  }).length;
  
  const lastWeekTasks = tasks.filter(t => {
    if (t.status !== 'Done') return false;
    const updatedDate = new Date(t.updatedAt);
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return updatedDate >= lastWeek;
  }).length;
  
  const tasksGrowth = lastWeekTasks > 0 ? Math.round((lastWeekTasks / completedTasks) * 100) : 0;

  return (
    <ProjectManagerLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's what's happening with your projects.</p>
          </div>

        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Active Projects */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
              <FolderKanban className="text-blue-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Active Projects</p>
            <p className="text-3xl font-bold text-gray-900">{activeProjects}</p>
            <p className="text-xs text-green-600 mt-2">
              {lastMonthProjects > 0 ? `+${lastMonthProjects} this month` : 'No new projects this month'}
            </p>
          </div>

          {/* Tasks Completed */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
              <CheckSquare className="text-green-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Tasks Completed</p>
            <p className="text-3xl font-bold text-gray-900">{completedTasks}</p>
            <p className="text-xs text-green-600 mt-2">
              {lastWeekTasks > 0 ? `+${lastWeekTasks} from last week` : 'Keep it up!'}
            </p>
          </div>

          {/* Hours Logged */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg mb-4">
              <Clock className="text-purple-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Hours Logged</p>
            <p className="text-3xl font-bold text-gray-900">{Math.round(totalHours).toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-2">This month</p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-lg mb-4">
              <TrendingUp className="text-yellow-600" size={24} />
            </div>
            <p className="text-sm text-gray-500 mb-1">Revenue</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatAmount(totalRevenue)}
            </p>
            <p className="text-xs text-gray-500 mt-2">From sales orders</p>
          </div>
        </div>

        {/* Active Projects Section */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
            <button 
              onClick={() => navigate('/projects')}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <span className="text-sm font-medium">View All</span>
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {projects.filter(p => p.status === 'Active' || p.status === 'Planning').slice(0, 4).map((project) => {
              const progress = parseFloat(project.progress) || 0;
              const budget = parseFloat(project.budget) || 0;
              const spent = budget * (progress / 100);

              return (
                <div
                  key={project.id}
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className="border border-gray-100 rounded-xl p-6 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.client || 'Client Name'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status === 'Active' ? 'In Progress' : project.status}
                    </span>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${getProgressBarColor(progress)} transition-all duration-300`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users size={16} />
                        <span>{project.teamSize || 5} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign size={16} />
                        <span>{currencySymbol}{Math.round(spent)}k / {currencySymbol}{Math.round(budget)}k</span>
                      </div>
                    </div>
                    <span className="text-gray-500">
                      Due {project.endDate ? new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {projects.filter(p => p.status === 'Active').length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No active projects found
            </div>
          )}
        </div>
      </div>
    </ProjectManagerLayout>
  );
};

export default ProjectManagerDashboard;
