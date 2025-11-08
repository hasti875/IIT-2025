import { useEffect, useState } from 'react';
import { taskService } from '../services';
import { Loader2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react';
import TeamMemberLayout from '../components/TeamMemberLayout';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO } from 'date-fns';

const TaskCalendar = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAll();
      setTasks(response.data || []);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  const calendarDays = Array(startingDayOfWeek).fill(null).concat(daysInMonth);

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Get tasks for selected date or today
  const getSelectedDayTasks = () => {
    const dateToCheck = selectedDate || new Date();
    return getTasksForDate(dateToCheck);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Done':
        return 'bg-green-100 text-green-700 border-green-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-500';
      case 'Medium':
        return 'bg-yellow-500';
      case 'Low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
    setSelectedDate(null);
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Calendar</h1>
            <p className="text-sm text-gray-500 mt-1">View your tasks in calendar format</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <CalendarIcon size={18} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <List size={18} />
              List
            </button>
          </div>
        </div>

        {viewMode === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => navigateMonth('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900">
                  {format(currentDate, 'MMMM yyyy')}
                </h2>
                <button
                  onClick={() => navigateMonth('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-2">
                {/* Day Headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {calendarDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const dayTasks = getTasksForDate(day);
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isCurrentDay
                          ? 'border-blue-300 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${
                        !isCurrentMonth ? 'opacity-40' : ''
                      }`}
                    >
                      <div className="flex flex-col h-full">
                        <span className={`text-sm font-medium ${
                          isCurrentDay ? 'text-blue-600' : 'text-gray-900'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        {dayTasks.length > 0 && (
                          <div className="flex-1 flex flex-col gap-1 mt-1">
                            {dayTasks.slice(0, 2).map((task, idx) => (
                              <div
                                key={idx}
                                className={`w-full h-1 rounded-full ${
                                  task.status === 'Done'
                                    ? 'bg-green-500'
                                    : task.status === 'In Progress'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400'
                                }`}
                              />
                            ))}
                            {dayTasks.length > 2 && (
                              <span className="text-xs text-gray-500">+{dayTasks.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Status Legend</h3>
                <div className="flex gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-gray-400"></div>
                    <span className="text-sm text-gray-600">To Do</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-gray-600">Completed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tasks for Selected Day */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Today\'s Tasks'}
              </h3>

              <div className="space-y-3">
                {getSelectedDayTasks().length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <CalendarIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No tasks for this day</p>
                  </div>
                ) : (
                  getSelectedDayTasks().map(task => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 text-sm">{task.name}</h4>
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                      </div>
                      
                      {task.description && (
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.Project && (
                          <span className="text-xs text-gray-500">{task.Project.name}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          /* List View */
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">All Tasks</h3>
              <div className="space-y-3">
                {tasks.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CalendarIcon size={48} className="mx-auto mb-2 opacity-20" />
                    <p>No tasks found</p>
                  </div>
                ) : (
                  tasks.map(task => (
                    <div
                      key={task.id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{task.name}</h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                          )}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      </div>

                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <CalendarIcon size={14} />
                            {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                          </span>
                        )}
                        {task.Project && (
                          <span className="text-xs text-gray-500">{task.Project.name}</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TeamMemberLayout>
  );
};

export default TaskCalendar;
