import { useEffect, useState } from 'react';
import { taskService, projectService, timesheetService } from '../services';
import { CheckSquare, Clock, FolderKanban, TrendingUp, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TeamMemberLayout from '../components/TeamMemberLayout';

const TeamMemberDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [tasksResponse, projectsResponse, timesheetsResponse] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        timesheetService.getTimesheets().catch(() => ({ data: [] }))
      ]);
      setTasks(tasksResponse.data || []);
      setProjects(projectsResponse.data || []);
      setTimesheets(timesheetsResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <TeamMemberLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading dashboard...</div>
        </div>
      </TeamMemberLayout>
    );
  }

  // Calculate metrics
  const myTasks = tasks.slice(0, 6); // Show first 6 tasks
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'Planning');
  const assignedProjects = activeProjects.slice(0, 4); // Show first 4 projects
  
  // Calculate hours this week from timesheets
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay()); // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0);
  
  const hoursThisWeek = timesheets
    .filter(ts => {
      const tsDate = new Date(ts.date || ts.createdAt);
      return tsDate >= startOfWeek;
    })
    .reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);

  return (
    <TeamMemberLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's your work summary</p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">My Tasks</p>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{myTasks.length}</p>
            <p className="text-xs text-green-600 mt-1">+{inProgressTasks} in progress</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Completed</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
            <p className="text-xs text-gray-500 mt-1">Tasks finished</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Active Projects</p>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderKanban className="text-purple-600" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{activeProjects.length}</p>
            <p className="text-xs text-gray-500 mt-1">Projects assigned</p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Hours This Week</p>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="text-yellow-600" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{Math.round(hoursThisWeek)}</p>
            <p className="text-xs text-gray-500 mt-1">Logged hours</p>
          </div>
        </div>

        {/* My Tasks Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Tasks</h2>
              <button
                onClick={() => navigate('/tasks')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="p-6">
            {myTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tasks assigned</p>
            ) : (
              <div className="space-y-3">
                {myTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/tasks')}
                  >
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{task.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {task.Project?.name || 'No Project'}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        task.status === 'Done'
                          ? 'bg-green-100 text-green-800'
                          : task.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* My Projects Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">My Projects</h2>
              <button
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View All
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
          <div className="p-6">
            {assignedProjects.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No projects assigned</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {assignedProjects.map((project) => (
                  <div
                    key={project.id}
                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{project.name}</h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : project.status === 'On Hold'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Progress: {project.progress || 0}%
                      </div>
                      <div className="w-1/2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full"
                            style={{ width: `${project.progress || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </TeamMemberLayout>
  );
};

export default TeamMemberDashboard;
