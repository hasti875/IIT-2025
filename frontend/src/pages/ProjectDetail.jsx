import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService, financeService, userService } from '../services';
import { ArrowLeft, Plus, Loader2, Edit, DollarSign, Calendar, Users, FileText, ShoppingCart, Receipt, CreditCard, TrendingUp, X } from 'lucide-react';
import RoleBasedLayout from '../components/RoleBasedLayout';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjectData();
    fetchUsers();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        projectService.getById(id),
        taskService.getAll({ projectId: id })
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
    } catch (error) {
      console.error('Failed to fetch project data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.create({
        ...taskFormData,
        projectId: id
      });
      setShowTaskModal(false);
      setTaskFormData({
        name: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        assignedTo: '',
        dueDate: ''
      });
      fetchProjectData(); // Refresh tasks
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task');
    }
  };

  // Calculate project progress based on tasks
  const calculateProgress = () => {
    if (!tasks || tasks.length === 0) return 0;
    const completedTasks = tasks.filter(task => task.status === 'Done').length;
    return Math.round((completedTasks / tasks.length) * 100);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Calculate spent budget (mock for now - can be enhanced with actual expenses)
  const calculateSpent = () => {
    // This is a placeholder - you can integrate with actual expense data
    const progress = calculateProgress();
    return (project?.budget || 0) * (progress / 100);
  };

  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      </RoleBasedLayout>
    );
  }

  if (!project) {
    return (
      <RoleBasedLayout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Project not found</p>
        </div>
      </RoleBasedLayout>
    );
  }

  const progress = calculateProgress();
  const spentBudget = calculateSpent();
  const profit = (project.budget || 0) - spentBudget;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'calendar', label: 'Calendar' },
    { id: 'team', label: 'Team' },
    { id: 'finances', label: 'Finances' }
  ];

  // Mock financial documents data
  const financialDocuments = [
    {
      type: 'Sales Order',
      id: 'SO-2024-001',
      amount: '$45,000',
      status: 'Confirmed',
      statusColor: 'bg-green-500',
      icon: FileText,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      type: 'Purchase Order',
      id: 'PO-2024-005',
      amount: '$12,500',
      status: 'Sent',
      statusColor: 'bg-blue-500',
      icon: ShoppingCart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      type: 'Invoice',
      id: 'INV-2024-128',
      amount: '$42,000',
      status: 'Paid',
      statusColor: 'bg-green-500',
      icon: Receipt,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      type: 'Vendor Bill',
      id: 'BILL-2024-089',
      amount: '$10,200',
      status: 'Paid',
      statusColor: 'bg-green-500',
      icon: CreditCard,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    }
  ];

  return (
    <RoleBasedLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/projects')} 
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-500 mt-1">{project.client || 'No client assigned'}</p>
              <p className="text-sm text-gray-600 mt-2">{project.description || 'No description'}</p>
            </div>
            <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
              project.status === 'Active' ? 'bg-blue-100 text-blue-700' :
              project.status === 'Completed' ? 'bg-green-100 text-green-700' :
              project.status === 'Planning' ? 'bg-orange-100 text-orange-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {project.status}
            </span>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Progress</p>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-blue-600" size={20} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{progress}%</p>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Budget Usage</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={20} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ${spentBudget.toLocaleString(undefined, { maximumFractionDigits: 1 })}k / ${((project.budget || 0) / 1000).toFixed(0)}k
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Profit</p>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-green-600" size={20} />
              </div>
            </div>
            <p className="text-xl font-bold text-gray-900">
              ${profit.toLocaleString(undefined, { maximumFractionDigits: 1 })}k
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Due Date</p>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-yellow-600" size={20} />
              </div>
            </div>
            <p className="text-lg font-semibold text-gray-900">{formatDate(project.endDate)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6">
            {/* Finances Tab Content */}
            {activeTab === 'finances' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-6">Financial Documents</h2>
                <div className="space-y-3">
                  {financialDocuments.map((doc, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 ${doc.iconBg} rounded-lg flex items-center justify-center`}>
                          <doc.icon className={doc.iconColor} size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{doc.type}</h3>
                          <p className="text-sm text-gray-500">{doc.id}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="text-lg font-semibold text-gray-900">{doc.amount}</p>
                        <span className={`px-3 py-1 ${doc.statusColor} text-white rounded-md text-sm font-medium`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Project Overview</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-600">{project.description || 'No description provided'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Client</h3>
                      <p className="text-gray-900">{project.client || 'Not assigned'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Start Date</h3>
                      <p className="text-gray-900">{formatDate(project.startDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">End Date</h3>
                      <p className="text-gray-900">{formatDate(project.endDate)}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Budget</h3>
                      <p className="text-gray-900">${project.budget?.toLocaleString() || '0'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Status</h3>
                      <p className="text-gray-900">{project.status || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-700 mb-2">Tasks Progress</h3>
                      <p className="text-gray-900">{tasks.filter(t => t.status === 'Done').length} / {tasks.length} completed</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab Content */}
            {activeTab === 'tasks' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Project Tasks</h2>
                  <button 
                    onClick={() => setShowTaskModal(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={20} />
                    New Task
                  </button>
                </div>
                {tasks && tasks.length > 0 ? (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{task.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{task.description || 'No description'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          task.status === 'Done' ? 'bg-green-100 text-green-800' :
                          task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                          task.status === 'To Do' ? 'bg-gray-100 text-gray-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No tasks created yet. Click "New Task" to add one.</p>
                )}
              </div>
            )}

            {/* Calendar Tab Content */}
            {activeTab === 'calendar' && (
              <div className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar View</h3>
                <p className="text-gray-600">Calendar integration coming soon</p>
              </div>
            )}

            {/* Team Tab Content */}
            {activeTab === 'team' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                  <button 
                    onClick={() => setShowTeamModal(true)}
                    className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    <Plus size={20} />
                    Add Member
                  </button>
                </div>
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-400 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Team Management</h3>
                  <p className="text-gray-600">Team member assignment coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Create New Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Task Name *</label>
                  <input
                    type="text"
                    required
                    value={taskFormData.name}
                    onChange={(e) => setTaskFormData({ ...taskFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={taskFormData.description}
                    onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter task description"
                    rows="3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={taskFormData.status}
                      onChange={(e) => setTaskFormData({ ...taskFormData, status: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={taskFormData.priority}
                      onChange={(e) => setTaskFormData({ ...taskFormData, priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                  <select
                    value={taskFormData.assignedTo}
                    onChange={(e) => setTaskFormData({ ...taskFormData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Unassigned</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name} ({user.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Team Member</h2>
              <button onClick={() => setShowTeamModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <div className="text-center py-8">
              <Users className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-gray-600 mb-4">Team member assignment feature coming soon!</p>
              <p className="text-sm text-gray-500">You can assign users to tasks when creating them.</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
};

export default ProjectDetail;
