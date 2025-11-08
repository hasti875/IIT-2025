import { useState } from 'react';
import { projectService } from '../services';
import { X } from 'lucide-react';

const CreateProjectModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    startDate: '',
    endDate: '',
    status: 'Planning'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate date fields
    if (name === 'startDate' || name === 'endDate') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const selectedDate = new Date(value);
      selectedDate.setHours(0, 0, 0, 0);
      
      // Check if selected date is in the past
      if (selectedDate < today) {
        alert('Project dates cannot be in the past. Please select today or a future date.');
        return;
      }
      
      // If changing end date, ensure it's after start date
      if (name === 'endDate' && formData.startDate) {
        const startDate = new Date(formData.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < startDate) {
          alert('End date cannot be before the start date.');
          return;
        }
      }
      
      // If changing start date and end date exists, ensure start is before end
      if (name === 'startDate' && formData.endDate) {
        const endDate = new Date(formData.endDate);
        endDate.setHours(0, 0, 0, 0);
        
        if (selectedDate > endDate) {
          alert('Start date cannot be after the end date.');
          return;
        }
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate dates before submission
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.startDate) {
      const startDate = new Date(formData.startDate);
      startDate.setHours(0, 0, 0, 0);
      
      if (startDate < today) {
        setError('Start date cannot be in the past. Please select today or a future date.');
        return;
      }
    }
    
    if (formData.endDate) {
      const endDate = new Date(formData.endDate);
      endDate.setHours(0, 0, 0, 0);
      
      if (endDate < today) {
        setError('End date cannot be in the past. Please select today or a future date.');
        return;
      }
      
      if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        startDate.setHours(0, 0, 0, 0);
        
        if (endDate < startDate) {
          setError('End date cannot be before the start date.');
          return;
        }
      }
    }
    
    setLoading(true);

    try {
      await projectService.create({
        ...formData,
        budget: parseFloat(formData.budget) || 0
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Create New Project</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="input"
              placeholder="Enter project name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input"
              placeholder="Enter project description"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget
              </label>
              <input
                type="number"
                name="budget"
                min="0"
                step="0.01"
                value={formData.budget}
                onChange={handleChange}
                className="input"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select name="status" value={formData.status} onChange={handleChange} className="input">
                <option value="Planning">Planning</option>
                <option value="Active">Active</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="input"
              />
              <p className="text-xs text-gray-600 mt-1">
                ⚠️ Project can start from today onwards
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="input"
              />
              <p className="text-xs text-gray-600 mt-1">
                ⚠️ Must be after or equal to start date
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-primary">
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
