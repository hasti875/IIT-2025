const { Timesheet, User, Task, Project } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all timesheets
// @route   GET /api/timesheets
// @access  Private
exports.getAllTimesheets = async (req, res) => {
  try {
    const { userId, taskId, projectId, startDate, endDate, status } = req.query;
    const where = {};

    if (userId) where.userId = userId;
    if (taskId) where.taskId = taskId;
    if (projectId) where.projectId = projectId;
    if (status) where.status = status;
    
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const timesheets = await Timesheet.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'hourlyRate'] },
        { model: Task, as: 'task', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ],
      order: [['date', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: timesheets.length,
      data: timesheets
    });
  } catch (error) {
    console.error('Get timesheets error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timesheets',
      error: error.message
    });
  }
};

// @desc    Create timesheet entry
// @route   POST /api/timesheets
// @access  Private
exports.createTimesheet = async (req, res) => {
  try {
    const { taskId, projectId, date, hours, billable, description } = req.body;

    if (!taskId || !hours) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and hours are required'
      });
    }

    // Verify task exists and get project
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const timesheet = await Timesheet.create({
      userId: req.user.id,
      taskId,
      projectId: projectId || task.projectId,
      date: date || new Date(),
      hours,
      billable: billable !== undefined ? billable : true,
      description,
      status: 'Submitted'
    });

    // Update task hours
    await task.update({
      hoursLogged: parseFloat(task.hoursLogged) + parseFloat(hours)
    });

    const timesheetWithDetails = await Timesheet.findByPk(timesheet.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Task, as: 'task', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Timesheet entry created successfully',
      data: timesheetWithDetails
    });
  } catch (error) {
    console.error('Create timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating timesheet',
      error: error.message
    });
  }
};

// @desc    Update timesheet entry
// @route   PUT /api/timesheets/:id
// @access  Private
exports.updateTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet entry not found'
      });
    }

    const { date, hours, billable, description, status } = req.body;
    const oldHours = timesheet.hours;

    await timesheet.update({
      date: date || timesheet.date,
      hours: hours !== undefined ? hours : timesheet.hours,
      billable: billable !== undefined ? billable : timesheet.billable,
      description: description !== undefined ? description : timesheet.description,
      status: status || timesheet.status
    });

    // Update task hours if changed
    if (hours && hours !== oldHours) {
      const task = await Task.findByPk(timesheet.taskId);
      const hoursDiff = parseFloat(hours) - parseFloat(oldHours);
      await task.update({
        hoursLogged: parseFloat(task.hoursLogged) + hoursDiff
      });
    }

    const updatedTimesheet = await Timesheet.findByPk(timesheet.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: Task, as: 'task', attributes: ['id', 'name'] },
        { model: Project, as: 'project', attributes: ['id', 'name'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Timesheet updated successfully',
      data: updatedTimesheet
    });
  } catch (error) {
    console.error('Update timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating timesheet',
      error: error.message
    });
  }
};

// @desc    Delete timesheet entry
// @route   DELETE /api/timesheets/:id
// @access  Private
exports.deleteTimesheet = async (req, res) => {
  try {
    const timesheet = await Timesheet.findByPk(req.params.id);

    if (!timesheet) {
      return res.status(404).json({
        success: false,
        message: 'Timesheet entry not found'
      });
    }

    // Update task hours
    const task = await Task.findByPk(timesheet.taskId);
    await task.update({
      hoursLogged: Math.max(0, parseFloat(task.hoursLogged) - parseFloat(timesheet.hours))
    });

    await timesheet.destroy();

    res.status(200).json({
      success: true,
      message: 'Timesheet entry deleted successfully'
    });
  } catch (error) {
    console.error('Delete timesheet error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting timesheet',
      error: error.message
    });
  }
};

// @desc    Get timesheet summary
// @route   GET /api/timesheets/summary
// @access  Private
exports.getTimesheetSummary = async (req, res) => {
  try {
    const { projectId, userId, startDate, endDate } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (userId) where.userId = userId;
    if (startDate && endDate) {
      where.date = { [Op.between]: [startDate, endDate] };
    }

    const timesheets = await Timesheet.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['hourlyRate'] }]
    });

    const summary = timesheets.reduce((acc, ts) => {
      const hours = parseFloat(ts.hours);
      const rate = parseFloat(ts.user.hourlyRate || 0);
      const cost = hours * rate;

      acc.totalHours += hours;
      acc.billableHours += ts.billable ? hours : 0;
      acc.nonBillableHours += !ts.billable ? hours : 0;
      acc.totalCost += cost;

      return acc;
    }, {
      totalHours: 0,
      billableHours: 0,
      nonBillableHours: 0,
      totalCost: 0
    });

    res.status(200).json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Get timesheet summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching timesheet summary',
      error: error.message
    });
  }
};
