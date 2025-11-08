const { Task, User, Project } = require('../models');

// Helper function to check and update project status based on tasks
const updateProjectStatus = async (projectId) => {
  try {
    const tasks = await Task.findAll({
      where: { projectId },
      attributes: ['id', 'status']
    });

    if (tasks.length === 0) {
      return; // No tasks, don't change project status
    }

    const allTasksDone = tasks.every(task => task.status === 'Done');
    
    if (allTasksDone) {
      await Project.update(
        { status: 'Completed' },
        { where: { id: projectId } }
      );
      console.log(`Project ${projectId} status updated to Completed - all tasks done`);
    }
  } catch (error) {
    console.error('Error updating project status:', error);
    // Don't throw error, just log it so task update still succeeds
  }
};

// @desc    Get all tasks
// @route   GET /api/tasks
// @access  Private
exports.getAllTasks = async (req, res) => {
  try {
    const { projectId, status, assignedTo } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    // Role-based filtering
    // Team Members can only see tasks assigned to them
    if (req.user && req.user.role === 'TeamMember') {
      where.assignedTo = req.user.id;
    }

    const tasks = await Task.findAll({
      where,
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tasks',
      error: error.message
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching task',
      error: error.message
    });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
exports.createTask = async (req, res) => {
  try {
    const { projectId, name, description, assignedTo, status, hoursLogged, estimatedHours, priority, dueDate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Project ID and task name are required'
      });
    }

    // Verify project exists
    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const task = await Task.create({
      projectId,
      name,
      description,
      assignedTo,
      status: status || 'New',
      hoursLogged: hoursLogged || 0,
      estimatedHours: estimatedHours || 0,
      priority: priority || 'Medium',
      dueDate
    });

    const taskWithDetails = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: taskWithDetails
    });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating task',
      error: error.message
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const { name, description, assignedTo, status, hoursLogged, estimatedHours, priority, dueDate } = req.body;

    await task.update({
      name: name || task.name,
      description: description !== undefined ? description : task.description,
      assignedTo: assignedTo !== undefined ? assignedTo : task.assignedTo,
      status: status || task.status,
      hoursLogged: hoursLogged !== undefined ? hoursLogged : task.hoursLogged,
      estimatedHours: estimatedHours !== undefined ? estimatedHours : task.estimatedHours,
      priority: priority || task.priority,
      dueDate: dueDate !== undefined ? dueDate : task.dueDate
    });

    // Check if all tasks are completed and update project status if needed
    await updateProjectStatus(task.projectId);

    const updatedTask = await Task.findByPk(task.id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating task',
      error: error.message
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findByPk(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const projectId = task.projectId;
    await task.destroy();

    // Check if all remaining tasks are completed and update project status if needed
    await updateProjectStatus(projectId);

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting task',
      error: error.message
    });
  }
};
