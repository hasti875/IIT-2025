import { useEffect, useState } from 'react';
import { taskService } from '../services';
import { Loader2, Clock, Calendar, Plus } from 'lucide-react';
import TeamMemberLayout from '../components/TeamMemberLayout';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showLogHoursModal, setShowLogHoursModal] = useState(false);
  const [hours, setHours] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll();
      // Filter tasks assigned to current user (mock filter for now)
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      await taskService.update(taskId, { status: newStatus });
      fetchMyTasks();
    } catch (error) {
      console.error('Failed to update task status:', error);
    }
  };

  const logHours = async () => {
    try {
      // This would call timesheet service to log hours
      console.log('Logging hours:', { taskId: selectedTask.id, hours, date });
      setShowLogHoursModal(false);
      setHours('');
      // Show success message
      alert('Hours logged successfully!');
    } catch (error) {
      console.error('Failed to log hours:', error);
    }
  };

  const tasksByStatus = {
    'To Do': tasks.filter(t => t.status === 'New'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done')
  };

  if (loading) {
    return (
      <TeamMemberLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      </TeamMemberLayout>
    );
  }

  return (
    <TeamMemberLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-500 mt-1">View and manage your assigned tasks</p>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    status === 'To Do' ? 'bg-gray-400' :
                    status === 'In Progress' ? 'bg-blue-500' :
                    'bg-green-500'
                  }`}></span>
                  {status}
                  <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 rounded-full text-xs">
                    {statusTasks.length}
                  </span>
                </h2>
              </div>

              <div className="space-y-3">
                {statusTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <h3 className="font-medium text-gray-900 mb-2">{task.name}</h3>
                    {task.description && (
                      <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    )}
                    
                    {/* Project Name */}
                    {task.project && (
                      <div className="mb-2">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                          📁 {task.project.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
                      <Calendar size={14} />
                      <span>{task.dueDate || 'No due date'}</span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {task.status === 'New' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'In Progress')}
                          className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                        >
                          Start Task
                        </button>
                      )}
                      {task.status === 'In Progress' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedTask(task);
                              setShowLogHoursModal(true);
                            }}
                            className="flex-1 px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                          >
                            <Clock size={14} />
                            Log Hours
                          </button>
                          <button
                            onClick={() => updateTaskStatus(task.id, 'Done')}
                            className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Complete
                          </button>
                        </>
                      )}
                      {task.status === 'Done' && (
                        <button
                          onClick={() => {
                            setSelectedTask(task);
                            setShowLogHoursModal(true);
                          }}
                          className="flex-1 px-3 py-1.5 bg-purple-500 text-white text-sm rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-1"
                        >
                          <Clock size={14} />
                          Log Hours
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {statusTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No tasks
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Log Hours Modal */}
        {showLogHoursModal && selectedTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Log Hours</h2>
              <p className="text-sm text-gray-600 mb-4">Task: {selectedTask.name}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    max={new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0]}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    placeholder="Enter hours worked"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowLogHoursModal(false);
                      setHours('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={logHours}
                    disabled={!hours || parseFloat(hours) <= 0}
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Log Hours
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </TeamMemberLayout>
  );
};

export default MyTasks;
