import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services';
import { Search, Loader2, FolderKanban, Users, DollarSign, Calendar } from 'lucide-react';
import RoleBasedLayout from '../components/RoleBasedLayout';
import CreateProjectModal from '../components/CreateProjectModal';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Projects');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      Planning: 'bg-orange-100 text-orange-700',
      Active: 'bg-blue-500 text-white',
      'On Hold': 'bg-yellow-100 text-yellow-700',
      Completed: 'bg-green-500 text-white',
      Cancelled: 'bg-red-100 text-red-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const getStatusLabel = (status) => {
    return status === 'Active' ? 'In Progress' : status;
  };

  const getProgressBarColor = (progress) => {
    if (progress >= 75) return 'bg-gradient-to-r from-blue-500 to-green-400';
    if (progress >= 30) return 'bg-gradient-to-r from-blue-500 to-cyan-400';
    return 'bg-blue-500';
  };

  // Filter logic
  const getFilteredProjects = () => {
    let filtered = projects;

    // Apply status filter
    if (statusFilter !== 'All Projects') {
      filtered = filtered.filter(p => {
        if (statusFilter === 'In Progress') return p.status === 'Active';
        if (statusFilter === 'Planned') return p.status === 'Planning';
        return p.status === statusFilter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredProjects = getFilteredProjects();

  // Calculate counts for filter tabs
  const statusCounts = {
    all: projects.length,
    inProgress: projects.filter(p => p.status === 'Active').length,
    planned: projects.filter(p => p.status === 'Planning').length,
    completed: projects.filter(p => p.status === 'Completed').length
  };

  return (
    <RoleBasedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and track all your projects</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            + New Project
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 border-b border-gray-200">
          {[
            { label: 'All Projects', count: statusCounts.all },
            { label: 'In Progress', count: statusCounts.inProgress },
            { label: 'Planned', count: statusCounts.planned },
            { label: 'Completed', count: statusCounts.completed }
          ].map((tab) => (
            <button
              key={tab.label}
              onClick={() => setStatusFilter(tab.label)}
              className={`pb-3 px-2 text-sm font-medium border-b-2 transition-colors ${
                statusFilter === tab.label
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin text-primary-600" size={48} />
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 text-center py-12">
            <FolderKanban className="mx-auto text-gray-400 mb-4" size={64} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Get started by creating your first project</p>
            <button onClick={() => setShowCreateModal(true)} className="btn btn-primary">
              Create Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const memberCount = Math.floor(Math.random() * 10) + 3;
              
              return (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ml-3 whitespace-nowrap ${getStatusColor(project.status)}`}>
                      {getStatusLabel(project.status)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-gray-900">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${getProgressBarColor(project.progress)}`}
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Project Stats */}
                  <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                    <div className="text-center">
                      <Users size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs font-medium text-gray-900">{memberCount}</p>
                      <p className="text-xs text-gray-500">Team</p>
                    </div>
                    <div className="text-center">
                      <DollarSign size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs font-medium text-gray-900">${(project.budget / 1000).toFixed(0)}k/${(project.budget / 1000).toFixed(0)}k</p>
                      <p className="text-xs text-gray-500">Budget</p>
                    </div>
                    <div className="text-center">
                      <Calendar size={16} className="mx-auto text-gray-400 mb-1" />
                      <p className="text-xs font-medium text-gray-900">
                        {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-xs text-gray-500">Due Date</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateProjectModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchProjects();
          }}
        />
      )}
    </RoleBasedLayout>
  );
};

export default Projects;
