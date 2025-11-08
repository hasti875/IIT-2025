import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, taskService, financeService } from '../services';
import { ArrowLeft, Plus, Loader2, Edit, DollarSign } from 'lucide-react';
import Layout from '../components/Layout';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await projectService.getById(id);
      setProject(response.data);
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="animate-spin text-primary-600" size={48} />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="card text-center py-12">
          <p className="text-gray-600">Project not found</p>
        </div>
      </Layout>
    );
  }

  const getTaskStatusColor = (status) => {
    const colors = {
      New: 'badge-info',
      'In Progress': 'badge-warning',
      Done: 'badge-success'
    };
    return colors[status] || 'badge-info';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <button onClick={() => navigate('/projects')} className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Back to Projects
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-2">{project.description}</p>
            </div>
            <button className="btn btn-secondary flex items-center">
              <Edit size={18} className="mr-2" />
              Edit
            </button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Revenue</p>
            <p className="text-2xl font-bold text-green-600">${project.metrics.totalRevenue.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Total Cost</p>
            <p className="text-2xl font-bold text-red-600">${(project.metrics.totalCost + project.metrics.totalExpenses).toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Profit</p>
            <p className={`text-2xl font-bold ${project.metrics.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${project.metrics.profit.toLocaleString()}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600 mb-1">Tasks Completed</p>
            <p className="text-2xl font-bold text-primary-600">{project.metrics.completedTasks}/{project.metrics.totalTasks}</p>
          </div>
        </div>

        {/* Tasks Section */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Tasks</h2>
            <button className="btn btn-primary btn-sm flex items-center">
              <Plus size={18} className="mr-2" />
              Add Task
            </button>
          </div>
          
          {project.tasks.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {project.tasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.name}</h3>
                    {task.assignee && (
                      <p className="text-sm text-gray-600 mt-1">Assigned to: {task.assignee.name}</p>
                    )}
                  </div>
                  <span className={`badge ${getTaskStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Finance Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Sales Orders</h3>
            {project.salesOrders.length === 0 ? (
              <p className="text-gray-600 text-sm">No sales orders</p>
            ) : (
              <div className="space-y-2">
                {project.salesOrders.map((so) => (
                  <div key={so.id} className="text-sm">
                    <p className="font-medium text-gray-900">{so.clientName}</p>
                    <p className="text-green-600">${parseFloat(so.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Purchase Orders</h3>
            {project.purchaseOrders.length === 0 ? (
              <p className="text-gray-600 text-sm">No purchase orders</p>
            ) : (
              <div className="space-y-2">
                {project.purchaseOrders.map((po) => (
                  <div key={po.id} className="text-sm">
                    <p className="font-medium text-gray-900">{po.vendorName}</p>
                    <p className="text-red-600">${parseFloat(po.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">Expenses</h3>
            {project.expenses.length === 0 ? (
              <p className="text-gray-600 text-sm">No expenses</p>
            ) : (
              <div className="space-y-2">
                {project.expenses.map((exp) => (
                  <div key={exp.id} className="text-sm">
                    <p className="font-medium text-gray-900">{exp.category}</p>
                    <p className="text-red-600">${parseFloat(exp.amount).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectDetail;
