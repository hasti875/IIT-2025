import { useState, useEffect } from 'react';
import { Clock, Plus, Calendar, Edit2, Trash2, X, Loader2, Download } from 'lucide-react';
import { timesheetService, projectService, taskService, authService } from '../services';
import RoleBasedLayout from '../components/RoleBasedLayout';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('weekly');
  const [showModal, setShowModal] = useState(false);
  const [editingTimesheet, setEditingTimesheet] = useState(null);
  const currentUser = authService.getCurrentUser();
  
  const [formData, setFormData] = useState({
    projectId: '',
    taskId: '',
    date: new Date().toISOString().split('T')[0],
    hours: '',
    billable: true,
    description: '',
    status: 'Draft'
  });

  const [filters, setFilters] = useState({
    week: 'current',
    status: 'all'
  });

  useEffect(() => {
    fetchTimesheets();
    fetchProjects();
  }, []);

  useEffect(() => {
    if (formData.projectId) {
      fetchTasksByProject(formData.projectId);
    }
  }, [formData.projectId]);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getTimesheets();
      setTimesheets(response.data || []);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await projectService.getAll();
      setProjects(response.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  const fetchTasksByProject = async (projectId) => {
    try {
      const response = await taskService.getAll({ projectId });
      setTasks(response.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]);
    }
  };

  const handleOpenModal = (timesheet = null) => {
    if (timesheet) {
      setEditingTimesheet(timesheet);
      setFormData({
        projectId: timesheet.projectId || '',
        taskId: timesheet.taskId || '',
        date: timesheet.date || new Date().toISOString().split('T')[0],
        hours: timesheet.hours || '',
        billable: timesheet.billable !== undefined ? timesheet.billable : true,
        description: timesheet.description || '',
        status: timesheet.status || 'Draft'
      });
    } else {
      setEditingTimesheet(null);
      setFormData({
        projectId: '',
        taskId: '',
        date: new Date().toISOString().split('T')[0],
        hours: '',
        billable: true,
        description: '',
        status: 'Draft'
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTimesheet(null);
    setFormData({
      projectId: '',
      taskId: '',
      date: new Date().toISOString().split('T')[0],
      hours: '',
      billable: true,
      description: '',
      status: 'Draft'
    });
    setTasks([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.taskId || !formData.hours) {
      alert('Please select a task and enter hours');
      return;
    }

    try {
      if (editingTimesheet) {
        await timesheetService.updateTimesheet(editingTimesheet.id, formData);
      } else {
        await timesheetService.createTimesheet(formData);
      }
      
      handleCloseModal();
      fetchTimesheets();
    } catch (error) {
      console.error('Error saving timesheet:', error);
      alert('Failed to save timesheet entry');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this timesheet entry?')) return;
    
    try {
      await timesheetService.deleteTimesheet(id);
      fetchTimesheets();
    } catch (error) {
      console.error('Error deleting timesheet:', error);
      alert('Failed to delete timesheet entry');
    }
  };

  const handleGenerateReport = () => {
    try {
      // Filter timesheets based on current filters
      const dataToExport = filteredTimesheets;
      
      if (dataToExport.length === 0) {
        alert('No timesheet data to export');
        return;
      }

      // Create CSV content
      const headers = ['Date', 'Project', 'Task', 'Hours', 'Billable', 'Status', 'Description'];
      const csvContent = [
        headers.join(','),
        ...dataToExport.map(ts => [
          new Date(ts.date).toLocaleDateString(),
          ts.project?.name || 'N/A',
          ts.task?.name || 'N/A',
          ts.hours,
          ts.billable ? 'Yes' : 'No',
          ts.status,
          `"${(ts.description || '').replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `timesheet_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      alert('Timesheet report downloaded successfully!');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate timesheet report');
    }
  };

  const handleSubmitForApproval = async (id) => {
    try {
      await timesheetService.updateTimesheet(id, { status: 'Submitted' });
      fetchTimesheets();
    } catch (error) {
      console.error('Error submitting timesheet:', error);
      alert('Failed to submit timesheet for approval');
    }
  };

  const handleBulkSubmit = async () => {
    const draftTimesheets = filteredTimesheets.filter(ts => ts.status === 'Draft');
    if (draftTimesheets.length === 0) {
      alert('No draft timesheets to submit');
      return;
    }

    if (!window.confirm(`Submit ${draftTimesheets.length} draft timesheet(s) for approval?`)) return;

    try {
      await Promise.all(
        draftTimesheets.map(ts => timesheetService.updateTimesheet(ts.id, { status: 'Submitted' }))
      );
      fetchTimesheets();
      alert('Timesheets submitted successfully!');
    } catch (error) {
      console.error('Error submitting timesheets:', error);
      alert('Failed to submit timesheets');
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

  // Get week boundaries
  const getWeekBoundaries = (weekType) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (weekType === 'current') {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday, end: sunday };
    } else if (weekType === 'last') {
      const dayOfWeek = today.getDay();
      const monday = new Date(today);
      monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1) - 7);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      return { start: monday, end: sunday };
    }
    return null;
  };

  // Calculate summary metrics
  const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
  const billableHours = timesheets
    .filter(ts => ts.billable)
    .reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
  const nonBillableHours = totalHours - billableHours;

  // Filter timesheets based on active filter
  const getFilteredTimesheets = () => {
    let filtered = timesheets;

    // Filter by week
    if (filters.week !== 'all') {
      const weekBounds = getWeekBoundaries(filters.week);
      if (weekBounds) {
        filtered = filtered.filter(ts => {
          const tsDate = new Date(ts.date);
          return tsDate >= weekBounds.start && tsDate <= weekBounds.end;
        });
      }
    }

    // Filter by status
    if (filters.status !== 'all') {
      filtered = filtered.filter(ts => ts.status === filters.status);
    }

    // Apply time-based filter from activeFilter
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (activeFilter === 'daily') {
      filtered = filtered.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate.toDateString() === today.toDateString();
      });
    } else if (activeFilter === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      filtered = filtered.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate >= weekAgo;
      });
    } else if (activeFilter === 'monthly') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      filtered = filtered.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate >= monthAgo;
      });
    }
    
    return filtered;
  };

  const filteredTimesheets = getFilteredTimesheets();

  if (loading) {
    return (
      <RoleBasedLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading timesheets...</div>
        </div>
      </RoleBasedLayout>
    );
  }

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Timesheets</h1>
            <p className="text-sm text-gray-500 mt-1">Track time spent on projects and tasks</p>
          </div>
          <div className="flex gap-3">
            {currentUser?.role !== 'Finance' && (
              <>
                {filteredTimesheets.filter(ts => ts.status === 'Draft').length > 0 && (
                  <button 
                    onClick={handleBulkSubmit}
                    className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Submit Drafts for Approval
                  </button>
                )}
                <button 
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  title="Download timesheet report as CSV"
                >
                  <Download size={20} />
                  Generate Report
                </button>
                <button 
                  onClick={() => handleOpenModal()}
                  className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Plus size={20} />
                  Log Time
                </button>
              </>
            )}
            {currentUser?.role === 'Finance' && (
              <>
                <button 
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
                  title="Download timesheet report as CSV"
                >
                  <Download size={20} />
                  Generate Report
                </button>
                <div className="text-sm text-gray-500 italic flex items-center">
                  Finance role cannot log timesheets
                </div>
              </>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Total Hours</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalHours.toFixed(1)}h
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Billable Hours</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {billableHours.toFixed(1)}h
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Non-Billable Hours</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {nonBillableHours.toFixed(1)}h
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Week</label>
              <select
                value={filters.week}
                onChange={(e) => setFilters({ ...filters, week: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="current">Current Week</option>
                <option value="last">Last Week</option>
                <option value="all">All Weeks</option>
              </select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Submitted">Submitted</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Billed">Billed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Time Entries</h2>
                <p className="text-sm text-gray-500 mt-1">
                  {activeFilter === 'daily' && 'Showing entries for today'}
                  {activeFilter === 'weekly' && 'Showing entries for this week'}
                  {activeFilter === 'monthly' && 'Showing entries for this month'}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveFilter('daily')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === 'daily'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={18} />
                  Daily
                </button>
                <button
                  onClick={() => setActiveFilter('weekly')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === 'weekly'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={18} />
                  Weekly
                </button>
                <button
                  onClick={() => setActiveFilter('monthly')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    activeFilter === 'monthly'
                      ? 'bg-blue-50 text-blue-600 border border-blue-200'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Calendar size={18} />
                  Monthly
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project / Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                      No time entries found
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(timesheet.date).toLocaleDateString('en-US', { 
                          weekday: 'short',
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="font-medium text-gray-900">
                          {timesheet.project?.name || timesheet.projectName || 'N/A'}
                        </div>
                        <div className="text-gray-500 text-xs">
                          {timesheet.task?.name || timesheet.taskName || 'N/A'}
                        </div>
                        {timesheet.description && (
                          <div className="text-gray-400 text-xs mt-1 truncate max-w-xs">
                            {timesheet.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        {timesheet.hours}h
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          timesheet.billable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {timesheet.billable ? 'Billable' : 'Non-billable'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(timesheet.status)}`}>
                          {timesheet.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {currentUser?.role !== 'Finance' && (
                            <>
                              {timesheet.status === 'Draft' && (
                                <>
                                  <button
                                    onClick={() => handleOpenModal(timesheet)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                    title="Edit"
                                    disabled={timesheet.status !== 'Draft'}
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleSubmitForApproval(timesheet.id)}
                                    className="text-green-600 hover:text-green-800 px-2 py-1 text-xs rounded hover:bg-green-50"
                                    title="Submit for Approval"
                                  >
                                    Submit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(timesheet.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {timesheet.status === 'Rejected' && (
                                <>
                                  <button
                                    onClick={() => handleOpenModal(timesheet)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                                    title="Edit"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(timesheet.id)}
                                    className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </>
                              )}
                              {(timesheet.status === 'Submitted' || timesheet.status === 'Approved' || timesheet.status === 'Billed') && (
                                <span className="text-xs text-gray-500">No actions</span>
                              )}
                            </>
                          )}
                          {currentUser?.role === 'Finance' && (
                            <span className="text-xs text-gray-500">View only</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTimesheet ? 'Edit Time Entry' : 'Log Time'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Project Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.projectId}
                    onChange={(e) => setFormData({ ...formData, projectId: e.target.value, taskId: '' })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a project</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Task Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.taskId}
                    onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!formData.projectId}
                  >
                    <option value="">Select a task</option>
                    {tasks.map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.name}
                      </option>
                    ))}
                  </select>
                  {!formData.projectId && (
                    <p className="text-xs text-gray-500 mt-1">Select a project first</p>
                  )}
                </div>

                {/* Date and Hours */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.25"
                      min="0"
                      max="24"
                      value={formData.hours}
                      onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 8.5"
                      required
                    />
                  </div>
                </div>

                {/* Billable Checkbox */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.billable}
                      onChange={(e) => setFormData({ ...formData, billable: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Billable</span>
                  </label>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="What did you work on?"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingTimesheet ? 'Update Entry' : 'Log Time'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
};

export default Timesheets;
