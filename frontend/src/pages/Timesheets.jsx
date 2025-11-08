import { useState, useEffect } from 'react';
import { Clock, Plus, Calendar } from 'lucide-react';
import { timesheetService } from '../services';
import Layout from '../components/Layout';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('weekly');

  useEffect(() => {
    fetchTimesheets();
  }, []);

  const fetchTimesheets = async () => {
    try {
      setLoading(true);
      const response = await timesheetService.getTimesheets();
      // Backend returns { success: true, count: number, data: array }
      setTimesheets(response.data || []);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
      setTimesheets([]);
    } finally {
      setLoading(false);
    }
  };

  // Calculate summary metrics
  const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
  const billableHours = timesheets
    .filter(ts => ts.billable)
    .reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
  const nonBillableHours = totalHours - billableHours;

  // Filter timesheets based on active filter
  const getFilteredTimesheets = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (activeFilter === 'daily') {
      return timesheets.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate.toDateString() === today.toDateString();
      });
    } else if (activeFilter === 'weekly') {
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      return timesheets.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate >= weekAgo;
      });
    } else if (activeFilter === 'monthly') {
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      return timesheets.filter(ts => {
        const tsDate = new Date(ts.date);
        return tsDate >= monthAgo;
      });
    }
    return timesheets;
  };

  const filteredTimesheets = getFilteredTimesheets();

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading timesheets...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Timesheets</h1>
            <p className="text-gray-500 mt-1">Track time spent on projects and tasks</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            <Plus size={20} />
            Log Time
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Total Hours</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {totalHours}h
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Billable Hours</p>
            </div>
            <p className="text-3xl font-bold text-green-600">
              {billableHours}h
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 text-gray-500 mb-2">
              <Clock size={18} />
              <p className="text-sm">Non-Billable Hours</p>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {nonBillableHours}h
            </p>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Time Entries</h2>
                <p className="text-sm text-gray-500 mt-1">Showing entries for this week</p>
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
                    Employee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Billable
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {filteredTimesheets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                      No time entries found
                    </td>
                  </tr>
                ) : (
                  filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(timesheet.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: '2-digit', 
                          day: '2-digit' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.user?.name || timesheet.employee || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {timesheet.project?.name || timesheet.projectName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {timesheet.task?.title || timesheet.taskName || 'N/A'}
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
                          {timesheet.billable ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                        Edit
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Timesheets;
