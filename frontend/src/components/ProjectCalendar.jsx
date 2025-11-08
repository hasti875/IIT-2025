import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parseISO, isWithinInterval, isBefore, startOfDay } from 'date-fns';
import { ChevronLeft, ChevronRight, X, Target, CheckCircle2, Calendar as CalendarIcon, DollarSign } from 'lucide-react';

const ProjectCalendar = ({ project, tasks, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'

  // Get all days in the current month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get starting day of week (0 = Sunday)
  const startingDayOfWeek = monthStart.getDay();

  // Add empty cells for days before month starts
  const calendarDays = Array(startingDayOfWeek).fill(null).concat(daysInMonth);

  // Parse project dates
  const projectStartDate = project?.startDate ? parseISO(project.startDate) : null;
  const projectEndDate = project?.endDate ? parseISO(project.endDate) : null;

  // Check if a day is within project timeline
  const isProjectDay = (date) => {
    if (!date || !projectStartDate || !projectEndDate) return false;
    return isWithinInterval(date, { start: projectStartDate, end: projectEndDate });
  };

  // Get tasks for a specific date
  const getTasksForDate = (date) => {
    if (!date) return [];
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = parseISO(task.dueDate);
      return isSameDay(taskDate, date);
    });
  };

  // Check if task is overdue
  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.status === 'Done') return false;
    const taskDate = parseISO(task.dueDate);
    return isBefore(taskDate, startOfDay(new Date()));
  };

  const navigateMonth = (direction) => {
    if (direction === 'prev') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Calculate task statistics
  const highPriorityTasks = tasks.filter(t => t.priority === 'High' || t.priority === 'Critical').length;
  const milestones = tasks.filter(t => t.priority === 'Critical').length;
  const upcomingTasks = tasks.filter(t => {
    if (!t.dueDate || t.status === 'Done') return false;
    const taskDate = parseISO(t.dueDate);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return taskDate >= today && taskDate <= weekFromNow;
  }).length;
  const overdueTasks = tasks.filter(t => isTaskOverdue(t)).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <CalendarIcon className="text-blue-600" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Project Calendar</h2>
                <p className="text-xs text-gray-500">{project?.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* View Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight size={18} />
              </button>
              <h3 className="text-base font-bold text-gray-900 ml-2">
                {format(currentDate, 'MMMM yyyy')}
              </h3>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'month'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'week'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  viewMode === 'day'
                    ? 'bg-gray-900 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                day
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="p-4">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="grid grid-cols-7 border-b border-gray-200">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-xs font-semibold text-gray-600 py-2 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="min-h-[90px] border-r border-b border-gray-200 bg-gray-50"
                    />
                  );
                }

                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const isInProjectTimeline = isProjectDay(day);
                
                // Check for overdue tasks on this day
                const hasOverdueTasks = dayTasks.some(task => isTaskOverdue(task));

                return (
                  <div
                    key={day.toISOString()}
                    className={`min-h-[90px] border-r border-b border-gray-200 p-1.5 transition-all ${
                      !isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white'
                    } ${
                      isInProjectTimeline && isCurrentMonth ? 'bg-yellow-50' : ''
                    } ${
                      hasOverdueTasks ? 'bg-red-50' : ''
                    } hover:bg-blue-50 cursor-pointer last:border-r-0`}
                  >
                    <div className="flex flex-col h-full">
                      {/* Day Number */}
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-xs font-medium ${
                          isCurrentDay 
                            ? 'w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white text-[10px]' 
                            : hasOverdueTasks
                            ? 'text-red-600'
                            : isInProjectTimeline
                            ? 'text-yellow-700'
                            : 'text-gray-900'
                        }`}>
                          {format(day, 'd')}
                        </span>
                      </div>

                      {/* Task Indicators */}
                      {dayTasks.length > 0 && (
                        <div className="flex-1 flex flex-col gap-0.5 overflow-hidden">
                          {dayTasks.slice(0, 2).map((task, idx) => (
                            <div
                              key={idx}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate ${
                                isTaskOverdue(task)
                                  ? 'bg-red-500 text-white'
                                  : task.status === 'Done'
                                  ? 'bg-green-500 text-white'
                                  : task.status === 'In Progress'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-400 text-white'
                              }`}
                              title={task.name}
                            >
                              {task.name.length > 10 ? task.name.substring(0, 10) + '...' : task.name}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <span className="text-[10px] text-gray-500 font-medium px-1">
                              +{dayTasks.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Stats Cards */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Target className="text-red-600" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900">{highPriorityTasks}</div>
                  <div className="text-[10px] text-gray-600 truncate">High Priority</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="text-purple-600" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900">{milestones}</div>
                  <div className="text-[10px] text-gray-600 truncate">Milestones</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CalendarIcon className="text-blue-600" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900">{upcomingTasks}</div>
                  <div className="text-[10px] text-gray-600 truncate">Upcoming</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <DollarSign className="text-green-600" size={16} />
                </div>
                <div className="min-w-0">
                  <div className="text-lg font-bold text-gray-900">{overdueTasks}</div>
                  <div className="text-[10px] text-gray-600 truncate">Overdue</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCalendar;
