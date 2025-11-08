import { useEffect, useState } from 'react';
import { taskService } from '../services';
import { Loader2, User, Plus } from 'lucide-react';
import RoleBasedLayout from '../components/RoleBasedLayout';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverColumn, setDragOverColumn] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll();
      setTasks(response.data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
    e.target.style.opacity = '0.5';
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1';
    setDraggedTask(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (!draggedTask || draggedTask.status === newStatus) {
      return;
    }

    try {
      // Update task status in backend
      await taskService.update(draggedTask.id, { status: newStatus });
      
      // Update local state
      setTasks(tasks.map(task => 
        task.id === draggedTask.id 
          ? { ...task, status: newStatus }
          : task
      ));
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Task moved to ${newStatus}`
      });
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      console.error('Failed to update task status:', error);
      setNotification({
        type: 'error',
        message: 'Failed to update task'
      });
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      Critical: 'bg-red-100 text-red-700',
      High: 'bg-orange-100 text-orange-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Low: 'bg-gray-100 text-gray-700'
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
  };

  const groupedTasks = {
    New: tasks.filter(t => t.status === 'New'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Blocked: tasks.filter(t => t.status === 'Blocked'),
    Done: tasks.filter(t => t.status === 'Done')
  };

  return (
    <RoleBasedLayout>
      <div className="p-8">
        {/* Success/Error Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-slide-in ${
            notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            <span>{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-sm text-gray-500 mt-1">Manage tasks across all projects</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <span className="text-xl">+</span>
            New Task
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-blue-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <div 
                key={status} 
                className="flex flex-col bg-gray-50 rounded-xl p-4"
                onDragOver={(e) => handleDragOver(e, status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, status)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                  <h3 className={`font-bold text-sm ${
                    status === 'New' ? 'text-gray-700' :
                    status === 'In Progress' ? 'text-blue-600' :
                    status === 'Blocked' ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {status} ({statusTasks.length})
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 transition-colors text-xl font-bold">
                    +
                  </button>
                </div>

                {/* Task Cards Drop Zone */}
                <div className={`space-y-3 flex-1 min-h-[500px] transition-all rounded-lg ${
                  dragOverColumn === status 
                    ? 'bg-blue-100 ring-2 ring-blue-400' 
                    : ''
                }`}>
                  {statusTasks.map((task) => {
                    // Generate initials for avatar
                    const initials = task.assignee?.name 
                      ? task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : 'U';
                    
                    return (
                      <div 
                        key={task.id}
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-move border-l-4 ${
                          status === 'New' ? 'border-gray-400' :
                          status === 'In Progress' ? 'border-blue-500' :
                          status === 'Blocked' ? 'border-red-500' :
                          'border-green-500'
                        } ${draggedTask?.id === task.id ? 'opacity-50 scale-95' : ''}`}
                      >
                        <h4 className="font-semibold text-gray-900 mb-1 text-sm">
                          {task.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-3">
                          {task.project?.name || 'No Project'}
                        </p>

                        <div className="flex items-center justify-between">
                          {/* Avatar */}
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">{initials}</span>
                            </div>
                          </div>

                          {/* Priority Badge */}
                          {task.priority && (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {statusTasks.length === 0 && (
                    <div className="rounded-lg p-8 text-center text-gray-400 text-sm">
                      Drop tasks here
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </RoleBasedLayout>
  );
};

export default Tasks;
