import { useEffect, useState } from 'react';
import { taskService } from '../services';
import { Loader2, User } from 'lucide-react';
import Layout from '../components/Layout';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getPriorityColor = (priority) => {
    const colors = {
      High: 'bg-red-500 text-white',
      Medium: 'bg-orange-400 text-white',
      Low: 'bg-gray-400 text-white'
    };
    return colors[priority] || 'bg-gray-400 text-white';
  };

  const groupedTasks = {
    New: tasks.filter(t => t.status === 'New'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    Blocked: tasks.filter(t => t.status === 'Blocked'),
    Done: tasks.filter(t => t.status === 'Done')
  };

  const columnStyles = {
    New: 'border-t-4 border-gray-300',
    'In Progress': 'border-t-4 border-blue-500',
    Blocked: 'border-t-4 border-red-500',
    Done: 'border-t-4 border-green-500'
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Board</h1>
            <p className="text-sm text-gray-500 mt-1">Manage tasks across all projects</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            + New Task
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={48} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {Object.entries(groupedTasks).map(([status, statusTasks]) => (
              <div key={status} className="flex flex-col">
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className={`font-semibold ${
                    status === 'New' ? 'text-gray-700' :
                    status === 'In Progress' ? 'text-blue-600' :
                    status === 'Blocked' ? 'text-red-600' :
                    'text-green-600'
                  }`}>
                    {status} ({statusTasks.length})
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600">
                    +
                  </button>
                </div>

                {/* Task Cards */}
                <div className="space-y-3 flex-1">
                  {statusTasks.map((task) => {
                    // Generate initials for avatar
                    const initials = task.assignee?.name 
                      ? task.assignee.name.split(' ').map(n => n[0]).join('').toUpperCase()
                      : 'U';
                    
                    return (
                      <div 
                        key={task.id} 
                        className={`bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${columnStyles[status]}`}
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
                    <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-400 text-sm border-2 border-dashed border-gray-200">
                      No tasks
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Tasks;
