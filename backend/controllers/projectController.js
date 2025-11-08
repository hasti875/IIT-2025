const { Project, User, Task, SalesOrder, PurchaseOrder, Expense, ProjectTeam } = require('../models');
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

    let projects;

    // Team Members can only see projects where they have assigned tasks
    if (req.user && req.user.role === 'TeamMember') {
      projects = await Project.findAll({
        where,
        include: [
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
          {
            model: Task,
            as: 'tasks',
            where: { assignedTo: req.user.id },
            required: true, // Only include projects that have tasks assigned to this user
            attributes: ['id', 'status']
          },
          { model: User, as: 'teamMembers', attributes: ['id'], through: { attributes: [] } }
        ],
        distinct: true,
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Admins and Project Managers see all projects (or filtered by managerId)
      projects = await Project.findAll({
        where,
        include: [
          { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
          { model: Task, as: 'tasks', attributes: ['id', 'status'] },
          { model: User, as: 'teamMembers', attributes: ['id'], through: { attributes: [] } }
        ],
        order: [['createdAt', 'DESC']]
      });
    }

    // Calculate progress for each project
    const projectsWithProgress = await Promise.all(projects.map(async project => {
      const projectData = project.toJSON();
      const tasks = projectData.tasks || [];
      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Done').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const teamMemberCount = projectData.teamMembers ? projectData.teamMembers.length : 0;
      
      // Auto-update project status based on task completion
      if (totalTasks > 0) {
        if (completedTasks === totalTasks && projectData.status !== 'Completed') {
          // All tasks done → Mark as Completed
          await Project.update(
            { status: 'Completed' },
            { where: { id: projectData.id } }
          );
          projectData.status = 'Completed';
        } else if (completedTasks < totalTasks && projectData.status === 'Completed') {
          // Not all tasks done but project marked as Completed → Revert to Active
          await Project.update(
            { status: 'Active' },
            { where: { id: projectData.id } }
          );
          projectData.status = 'Active';
        }
      }
      
      return {
        ...projectData,
        progress,
        taskCount: totalTasks,
        completedTaskCount: completedTasks,
        teamMemberCount
      };
    }));

    res.status(200).json({
      success: true,
      count: projectsWithProgress.length,
      data: projectsWithProgress
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
    const includeOptions = [
      { model: User, as: 'manager', attributes: ['id', 'name', 'email'] },
      { model: SalesOrder, as: 'salesOrders' },
      { model: PurchaseOrder, as: 'purchaseOrders' },
      { model: Expense, as: 'expenses' }
    ];

    // Filter tasks based on user role
    if (req.user && req.user.role === 'TeamMember') {
      // Team Members only see tasks assigned to them
      includeOptions.push({
        model: Task,
        as: 'tasks',
        where: { assignedTo: req.user.id },
        required: false, // Use LEFT JOIN to still show project even if no tasks
        include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }]
      });
    } else {
      // Admins and Project Managers see all tasks
      includeOptions.push({
        model: Task,
        as: 'tasks',
        include: [{ model: User, as: 'assignee', attributes: ['id', 'name'] }]
      });
    }

    const project = await Project.findByPk(req.params.id, {
      include: includeOptions
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
// @access  Private (ProjectManager - own projects, Admin - all projects)
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Check permissions:
    // - Admins can delete any project
    // - ProjectManagers can only delete their own projects
    if (req.user.role === 'ProjectManager' && project.managerId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized. You can only delete projects you manage.'
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

// @desc    Add team member to project
// @route   POST /api/projects/:id/team
// @access  Private (Admin, ProjectManager)
exports.addTeamMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const projectId = req.params.id;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide userId'
      });
    }

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add team member to project
    await project.addTeamMember(user);

    res.status(200).json({
      success: true,
      message: 'Team member added to project successfully'
    });
  } catch (error) {
    console.error('Add team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding team member',
      error: error.message
    });
  }
};

// @desc    Remove team member from project
// @route   DELETE /api/projects/:id/team/:userId
// @access  Private (Admin, ProjectManager)
exports.removeTeamMember = async (req, res) => {
  try {
    const { id: projectId, userId } = req.params;

    const project = await Project.findByPk(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove team member from project
    await project.removeTeamMember(user);

    res.status(200).json({
      success: true,
      message: 'Team member removed from project successfully'
    });
  } catch (error) {
    console.error('Remove team member error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing team member',
      error: error.message
    });
  }
};

// @desc    Get project team members
// @route   GET /api/projects/:id/team
// @access  Private
exports.getProjectTeam = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'teamMembers', 
          attributes: ['id', 'name', 'email', 'role'],
          through: { attributes: [] } // Exclude junction table data
        }
      ]
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.status(200).json({
      success: true,
      data: project.teamMembers
    });
  } catch (error) {
    console.error('Get project team error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project team',
      error: error.message
    });
  }
};
