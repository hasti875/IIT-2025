const { Project, User, Task, SalesOrder, PurchaseOrder, Expense } = require('../models');
const { Op } = require('sequelize');
const { sequelize } = require('../config/db');

// @desc    Get all projects
// @route   GET /api/projects
// @access  Private
exports.getAllProjects = async (req, res) => {
  try {
    const { status, managerId } = req.query;
    const where = {};

    if (status) where.status = status;
    if (managerId) where.managerId = managerId;

    const projects = await Project.findAll({
      where,
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// @desc    Get single project with details
// @route   GET /api/projects/:id
// @access  Private
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
        { 
          model: Task, 
          as: 'tasks',
          include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }]
        },
        { model: SalesOrder, as: 'salesOrders' },
        { model: PurchaseOrder, as: 'purchaseOrders' },
        { model: Expense, as: 'expenses' }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Calculate financial metrics
    const totalRevenue = project.salesOrders.reduce((sum, so) => sum + parseFloat(so.amount || 0), 0);
    const totalCost = project.purchaseOrders.reduce((sum, po) => sum + parseFloat(po.amount || 0), 0);
    const totalExpenses = project.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const profit = totalRevenue - (totalCost + totalExpenses);

    // Calculate task completion
    const totalTasks = project.tasks.length;
    const completedTasks = project.tasks.filter(t => t.status === 'Done').length;
    const taskProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...project.toJSON(),
        metrics: {
          totalRevenue,
          totalCost,
          totalExpenses,
          profit,
          totalTasks,
          completedTasks,
          taskProgress
        }
      }
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project',
      error: error.message
    });
  }
};

// @desc    Create new project
// @route   POST /api/projects
// @access  Private (ProjectManager, Admin)
exports.createProject = async (req, res) => {
  try {
    const { name, description, managerId, budget, startDate, endDate, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const project = await Project.create({
      name,
      description,
      managerId: managerId || req.user.id,
      budget: budget || 0,
      startDate,
      endDate,
      status: status || 'Planning'
    });

    const projectWithManager = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'manager', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: projectWithManager
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project',
      error: error.message
    });
  }
};

// @desc    Update project
// @route   PUT /api/projects/:id
// @access  Private (ProjectManager, Admin)
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const { name, description, budget, startDate, endDate, status, progress } = req.body;

    await project.update({
      name: name || project.name,
      description: description !== undefined ? description : project.description,
      budget: budget !== undefined ? budget : project.budget,
      startDate: startDate || project.startDate,
      endDate: endDate || project.endDate,
      status: status || project.status,
      progress: progress !== undefined ? progress : project.progress
    });

    const updatedProject = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'manager', attributes: ['id', 'name', 'email'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: updatedProject
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project',
      error: error.message
    });
  }
};

// @desc    Delete project
// @route   DELETE /api/projects/:id
// @access  Private (Admin)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.destroy();

    res.status(200).json({
      success: true,
      message: 'Project deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project',
      error: error.message
    });
  }
};
