import { useEffect, useState } from 'react';
import { dashboardService, projectService } from '../services';
import { FolderKanban, CheckSquare, Clock, TrendingUp, Loader2, Users, DollarSign, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCurrency } from '../context/CurrencyContext';

const Dashboard = () => {
  const { formatAmount } = useCurrency();
  const [analytics, setAnalytics] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, projectsRes] = await Promise.all([
        dashboardService.getAnalytics(),
        projectService.getAll()
      ]);
      setAnalytics(analyticsRes.data);
      setProjects(projectsRes.data.slice(0, 4)); // Get top 4 projects
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      </Layout>
    );
  }

  const { summary } = analytics;

  const kpis = [
    {
      title: 'Active Projects',
      value: summary.activeProjects,
      subtitle: `${summary.totalProjects} total projects`,
      icon: FolderKanban,
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-500'
    },
    {
      title: 'Tasks Completed',
      value: summary.tasksDone,
      subtitle: `${summary.totalTasks} total tasks`,
      icon: CheckSquare,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-500'
    },
    {
      title: 'Hours Logged',
      value: summary.hoursLogged?.toLocaleString() || '0',
      subtitle: 'This month',
      icon: Clock,
      bgColor: 'bg-amber-50',
      iconColor: 'text-amber-500'
    },
    {
      title: 'Revenue',
      value: formatAmount(0),
      subtitle: `${formatAmount(0)} profit`,
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-500'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning':
        return 'bg-orange-100 text-orange-700';
      case 'Active':
        return 'bg-blue-500 text-white';
      case 'Completed':
        return 'bg-green-500 text-white';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusLabel = (status) => {
    return status === 'Active' ? 'In Progress' : status;
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-green-400';
    if (progress >= 30) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
    return 'bg-blue-500';
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening with your projects.</p>
          </div>
          <button 
            onClick={() => navigate('/projects')}
            className="btn btn-primary flex items-center gap-2"
          >
            <span>+ New Project</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className={`${kpi.bgColor} p-2.5 rounded-lg`}>
                    <Icon className={kpi.iconColor} size={20} />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{kpi.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">{kpi.value}</p>
                  <p className="text-xs text-gray-400">{kpi.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Projects */}
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Active Projects</h2>
              <button 
                onClick={() => navigate('/projects')}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {projects.map((project) => {
              const memberCount = project.teamMemberCount || 0;
              const spent = Math.floor(project.budget * (project.progress / 100));
              
              return (
                <div 
                  key={project.id} 
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md cursor-pointer transition-all"
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                      <p className="text-sm text-gray-500">{project.clientName || 'Client Name'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-3 ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold text-gray-900">{project.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all ${getProgressBarColor(project.progress)}`}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm pt-2">
                      <div className="flex items-center gap-1 text-gray-600">
                        <Users size={14} />
                        <span>{memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <DollarSign size={14} />
                        <span>${spent?.toLocaleString() || '0'} / ${project.budget?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="text-gray-500 text-xs">
                        Due {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
