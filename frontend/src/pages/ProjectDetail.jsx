import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService, financeService, userService, authService, timesheetService } from '../services';
import { ArrowLeft, Plus, Loader2, Edit, DollarSign, Calendar, Users, FileText, ShoppingCart, Receipt, CreditCard, TrendingUp, X, Clock, Send, MessageCircle, Paperclip, Check, XCircle } from 'lucide-react';
import RoleBasedLayout from '../components/RoleBasedLayout';
import { useCurrency } from '../context/CurrencyContext';
import { useSocket } from '../context/SocketContext';

const ProjectDetail = () => {
  const { formatAmount, currencySymbol } = useCurrency();
  const { socket, connected } = useSocket();
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [financialDocs, setFinancialDocs] = useState({
    salesOrders: [],
    purchaseOrders: [],
    invoices: [],
    expenses: []
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [projectTimesheets, setProjectTimesheets] = useState([]);
  const [timesheetFilter, setTimesheetFilter] = useState('all');
  const messagesEndRef = useRef(null);
  const currentUser = authService.getCurrentUser();
  const [taskFormData, setTaskFormData] = useState({
    name: '',
    description: '',
    status: 'New',
    priority: 'Medium',
    assignedTo: '',
    dueDate: ''
  });

  useEffect(() => {
    fetchProjectData();
    fetchUsers();
    fetchTeamMembers();
    fetchFinancialDocs();
    fetchMessages();
    fetchProjectTimesheets();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    console.log('Team members state updated:', teamMembers);
  }, [teamMembers]);

  // Join project room and listen for Socket.IO events
  useEffect(() => {
    if (!socket || !id) return;

    // Join the project room
    socket.emit('join-project', id);

    // Listen for new messages
    const handleNewMessage = (data) => {
      // Compare project IDs as strings to avoid type mismatches between server and client
      if (String(data.projectId) === String(id)) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    // Listen for deleted messages
    const handleDeleteMessage = (data) => {
      // Compare IDs as strings to be robust against type differences
      if (String(data.projectId) === String(id)) {
        setMessages(prev => prev.filter(msg => String(msg.id) !== String(data.messageId)));
      }
    };

    socket.on('new-message', handleNewMessage);
    socket.on('delete-message', handleDeleteMessage);

    // Cleanup: leave room and remove listeners
    return () => {
      socket.emit('leave-project', id);
      socket.off('new-message', handleNewMessage);
      socket.off('delete-message', handleDeleteMessage);
    };
  }, [socket, id]);

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
      // Filter to show only Team Members and Project Managers
      const filteredUsers = (response.data || []).filter(user => 
        user.role === 'TeamMember' || user.role === 'ProjectManager'
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await projectService.getProjectTeam(id);
      console.log('Full team response:', response);
      console.log('response.data:', response.data);
      console.log('response.data type:', Array.isArray(response.data));
      setTeamMembers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      console.error('Error details:', error.response);
    }
  };

  const fetchFinancialDocs = async () => {
    try {
      const [soRes, poRes, invRes, expRes] = await Promise.all([
        financeService.getSalesOrders({ projectId: id }),
        financeService.getPurchaseOrders({ projectId: id }),
        financeService.getInvoices({ projectId: id }),
        financeService.getExpenses({ projectId: id })
      ]);
      
      setFinancialDocs({
        salesOrders: soRes.data || [],
        purchaseOrders: poRes.data || [],
        invoices: invRes.data || [],
        expenses: expRes.data || []
      });
    } catch (error) {
      console.error('Failed to fetch financial documents:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await projectService.getMessages(id);
      setMessages(response.data || []);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const fetchProjectTimesheets = async () => {
    try {
      const response = await timesheetService.getTimesheets({ projectId: id });
      setProjectTimesheets(response.data || []);
    } catch (error) {
      console.error('Failed to fetch project timesheets:', error);
    }
  };

  const handleApproveTimesheet = async (timesheetId) => {
    try {
      await timesheetService.updateTimesheet(timesheetId, { status: 'Approved' });
      fetchProjectTimesheets();
      alert('Timesheet approved successfully!');
    } catch (error) {
      console.error('Failed to approve timesheet:', error);
      alert('Failed to approve timesheet');
    }
  };

  const handleRejectTimesheet = async (timesheetId) => {
    const reason = prompt('Enter reason for rejection (optional):');
    try {
      await timesheetService.updateTimesheet(timesheetId, { 
        status: 'Rejected',
        rejectionReason: reason 
      });
      fetchProjectTimesheets();
      alert('Timesheet rejected');
    } catch (error) {
      console.error('Failed to reject timesheet:', error);
      alert('Failed to reject timesheet');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Draft': 'bg-gray-100 text-gray-800',
      'Submitted': 'bg-blue-100 text-blue-800',
      'Approved': 'bg-green-100 text-green-800',
      'Rejected': 'bg-red-100 text-red-800',
      'Billed': 'bg-purple-100 text-purple-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await projectService.sendMessage(id, {
        message: newMessage.trim()
      });
      // Don't update messages here - Socket.IO will handle it via 'new-message' event
      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;

    try {
      await projectService.deleteMessage(id, messageId);
      // Don't update messages here - Socket.IO will handle it via 'delete-message' event
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message');
    }
  };

  const handleAddTeamMember = async () => {
    if (!selectedUserId) {
      alert('Please select a team member');
      return;
    }

    try {
      await projectService.addTeamMember(id, selectedUserId);
      setShowTeamModal(false);
      setSelectedUserId('');
      fetchTeamMembers(); // Refresh team members
      alert('Team member added successfully!');
    } catch (error) {
      console.error('Failed to add team member:', error);
      alert('Failed to add team member');
    }
  };

  const handleRemoveTeamMember = async (userId) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      try {
        await projectService.removeTeamMember(id, userId);
        fetchTeamMembers(); // Refresh team members
      } catch (error) {
        console.error('Failed to remove team member:', error);
        alert('Failed to remove team member');
      }
    }
  };

  // Task drag and drop handlers
  const handleTaskDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleTaskDragEnd = () => {
    setDraggedTask(null);
  };

  const handleTaskDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleTaskDrop = async (e, newStatus) => {
    e.preventDefault();
    
    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    try {
      await taskService.update(draggedTask.id, { status: newStatus });
      
      // Update local state and recalculate progress
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus }
          : task
      ));
      
      setDraggedTask(null);
    } catch (error) {
      console.error('Failed to update task status:', error);
      alert('Failed to update task status');
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
        status: 'New',
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

  // Get task status breakdown
  const getTaskBreakdown = () => {
    if (!tasks || tasks.length === 0) return { new: 0, inProgress: 0, blocked: 0, done: 0 };
    return {
      new: tasks.filter(t => t.status === 'New').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      blocked: tasks.filter(t => t.status === 'Blocked').length,
      done: tasks.filter(t => t.status === 'Done').length
    };
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
  const taskBreakdown = getTaskBreakdown();
  const totalTasks = tasks.length;

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'timesheets', label: 'Timesheets' },
    { id: 'chat', label: 'Chat' },
    { id: 'team', label: 'Team' }
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
              <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{taskBreakdown.done} / {totalTasks} tasks done</span>
              {taskBreakdown.blocked > 0 && (
                <span className="text-red-600 font-medium">{taskBreakdown.blocked} blocked</span>
              )}
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
              {currencySymbol}{spentBudget.toLocaleString(undefined, { maximumFractionDigits: 1 })}k / {currencySymbol}{((project.budget || 0) / 1000).toFixed(0)}k
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
              {currencySymbol}{profit.toLocaleString(undefined, { maximumFractionDigits: 1 })}k
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
                      <p className="text-gray-900">{formatAmount(project.budget || 0)}</p>
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
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {['New', 'In Progress', 'Blocked', 'Done'].map((status) => {
                      const statusTasks = tasks.filter(t => t.status === status);
                      const statusColors = {
                        'New': { header: 'text-gray-700', bg: 'bg-gray-50', border: 'border-gray-300' },
                        'In Progress': { header: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' },
                        'Blocked': { header: 'text-red-600', bg: 'bg-red-50', border: 'border-red-300' },
                        'Done': { header: 'text-green-600', bg: 'bg-green-50', border: 'border-green-300' }
                      };
                      
                      return (
                        <div key={status} className="flex flex-col">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className={`font-semibold text-sm ${statusColors[status].header}`}>
                              {status} ({statusTasks.length})
                            </h3>
                          </div>
                          
                          <div 
                            className={`flex-1 min-h-[400px] rounded-lg p-3 border-2 ${statusColors[status].bg} ${statusColors[status].border} space-y-2`}
                            onDragOver={handleTaskDragOver}
                            onDrop={(e) => handleTaskDrop(e, status)}
                          >
                            {statusTasks.map((task) => (
                              <div
                                key={task.id}
                                draggable="true"
                                onDragStart={(e) => handleTaskDragStart(e, task)}
                                onDragEnd={handleTaskDragEnd}
                                className={`bg-white p-3 rounded-lg shadow-sm border hover:shadow-md transition-all cursor-move ${
                                  draggedTask?.id === task.id ? 'opacity-50' : ''
                                }`}
                              >
                                <h4 className="font-medium text-gray-900 text-sm mb-1">{task.name}</h4>
                                {task.description && (
                                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{task.description}</p>
                                )}
                                <div className="flex items-center justify-between">
                                  {task.assignee && (
                                    <div className="flex items-center gap-1">
                                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                        <span className="text-white text-xs font-medium">
                                          {task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                        </span>
                                      </div>
                                    </div>
                                  )}
                                  {task.priority && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                      task.priority === 'Critical' ? 'bg-red-100 text-red-700' :
                                      task.priority === 'High' ? 'bg-orange-100 text-orange-700' :
                                      task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {task.priority}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            
                            {statusTasks.length === 0 && (
                              <div className="text-center text-gray-400 text-xs py-8">
                                Drop tasks here
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No tasks created yet. Click "New Task" to add one.</p>
                )}
              </div>
            )}

            {/* Chat Tab Content */}
            {activeTab === 'chat' && (
              <div className="flex flex-col h-[600px]">
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle size={24} />
                    Project Chat — {project?.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">{teamMembers.length} team members online</p>
                </div>

                {/* Messages Container */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 overflow-y-auto mb-4 border border-gray-200">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <MessageCircle className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600">No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwnMessage = msg.userId === currentUser?.id;
                        const messageTime = new Date(msg.createdAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        });
                        const messageDate = new Date(msg.createdAt).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        });

                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                              {!isOwnMessage && (
                                <div className="flex items-center gap-2 mb-1">
                                  <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {msg.user?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  <span className="text-xs font-medium text-gray-700">{msg.user?.name}</span>
                                  <span className="text-xs text-gray-400">{messageTime}</span>
                                </div>
                              )}
                              <div
                                className={`rounded-lg p-3 ${
                                  isOwnMessage
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                }`}
                              >
                                <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                {isOwnMessage && (
                                  <div className="flex items-center justify-end gap-2 mt-1">
                                    <span className="text-xs opacity-75">{messageTime}</span>
                                    <button
                                      onClick={() => handleDeleteMessage(msg.id)}
                                      className="text-xs opacity-75 hover:opacity-100 underline"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Connection Status */}
                {!connected && (
                  <div className="mb-3 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    Reconnecting to chat...
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={sendingMessage || !connected}
                  />
                  <button
                    type="submit"
                    disabled={sendingMessage || !newMessage.trim() || !connected}
                    className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {sendingMessage ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <Send size={20} />
                        Send
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

            {/* Timesheets Tab Content */}
            {activeTab === 'timesheets' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Project Timesheets</h2>
                  <select
                    value={timesheetFilter}
                    onChange={(e) => setTimesheetFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Timesheets</option>
                    <option value="Submitted">Pending Approval</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                {/* Timesheet Summary */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium">Total Hours</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {projectTimesheets.reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0).toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium">Billable Hours</p>
                    <p className="text-2xl font-bold text-green-900">
                      {projectTimesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0).toFixed(1)}h
                    </p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-600 font-medium">Pending Approval</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {projectTimesheets.filter(ts => ts.status === 'Submitted').length}
                    </p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-600 font-medium">Approved</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {projectTimesheets.filter(ts => ts.status === 'Approved').length}
                    </p>
                  </div>
                </div>

                {/* Hours by Task Summary */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">Hours by Task</h3>
                  <div className="space-y-2">
                    {tasks.map(task => {
                      const taskHours = projectTimesheets
                        .filter(ts => ts.taskId === task.id)
                        .reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
                      if (taskHours === 0) return null;
                      return (
                        <div key={task.id} className="flex justify-between items-center">
                          <span className="text-sm text-gray-700">{task.name}</span>
                          <span className="text-sm font-semibold text-gray-900">{taskHours.toFixed(1)}h</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Timesheets Table */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Team Member</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Billable</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {projectTimesheets
                        .filter(ts => timesheetFilter === 'all' || ts.status === timesheetFilter)
                        .map((timesheet) => (
                        <tr key={timesheet.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {new Date(timesheet.date).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {timesheet.user?.name || 'N/A'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="font-medium text-gray-900">{timesheet.task?.name || 'N/A'}</div>
                            {timesheet.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">{timesheet.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{timesheet.hours}h</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              timesheet.billable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {timesheet.billable ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(timesheet.status)}`}>
                              {timesheet.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {timesheet.status === 'Submitted' && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleApproveTimesheet(timesheet.id)}
                                  className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50"
                                  title="Approve"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={() => handleRejectTimesheet(timesheet.id)}
                                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                  title="Reject"
                                >
                                  <XCircle size={18} />
                                </button>
                              </div>
                            )}
                            {timesheet.status !== 'Submitted' && (
                              <span className="text-xs text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {projectTimesheets.filter(ts => timesheetFilter === 'all' || ts.status === timesheetFilter).length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No timesheets found
                    </div>
                  )}
                </div>
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
                
                {teamMembers.length > 0 ? (
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{member.name}</h3>
                            <p className="text-sm text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            member.role === 'ProjectManager' ? 'bg-green-100 text-green-800' :
                            member.role === 'TeamMember' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role === 'ProjectManager' ? 'Project Manager' : 'Team Member'}
                          </span>
                          <button
                            onClick={() => handleRemoveTeamMember(member.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Remove from project"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="mx-auto text-gray-400 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members</h3>
                    <p className="text-gray-600">Click "Add Member" to assign team members to this project</p>
                  </div>
                )}
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
                      <option value="New">New</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Blocked">Blocked</option>
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
                      <option value="Critical">Critical</option>
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
                    {teamMembers.map(member => (
                      <option key={member.user?.id || member.id} value={member.user?.id || member.id}>
                        {member.user?.name || member.name} - {member.user?.role === 'TeamMember' ? 'Team Member' : member.user?.role === 'ProjectManager' ? 'Project Manager' : member.user?.role || member.role}
                      </option>
                    ))}
                  </select>
                  {teamMembers.length === 0 && (
                    <p className="text-xs text-gray-500 mt-1">No team members available</p>
                  )}
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
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Team Member</label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Choose a user --</option>
                  {users
                    .filter(user => !teamMembers.some(member => member.id === user.id))
                    .map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email}) - {user.role === 'ProjectManager' ? 'Project Manager' : 'Team Member'}
                      </option>
                    ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Only users not already in this project are shown
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowTeamModal(false);
                    setSelectedUserId('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTeamMember}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </RoleBasedLayout>
  );
};

export default ProjectDetail;
