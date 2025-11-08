const { Project, Task, SalesOrder, PurchaseOrder, Expense, User, Timesheet } = require('../models');
const { sequelize } = require('../config/db');
const { Op } = require('sequelize');

// @desc    Get dashboard analytics
// @route   GET /api/dashboard
// @access  Private
exports.getDashboardAnalytics = async (req, res) => {
  try {
    // Total Projects
    const totalProjects = await Project.count();
    const activeProjects = await Project.count({ where: { status: 'Active' } });
    const completedProjects = await Project.count({ where: { status: 'Completed' } });

    // Total Tasks
    const totalTasks = await Task.count();
    const tasksDone = await Task.count({ where: { status: 'Done' } });
    const tasksInProgress = await Task.count({ where: { status: 'In Progress' } });
    const tasksNew = await Task.count({ where: { status: 'New' } });
    const tasksBlocked = await Task.count({ where: { status: 'Blocked' } });

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Hours Logged (this month)
    const timesheets = await Timesheet.findAll({
      where: {
        date: {
          [Op.between]: [startOfMonth, endOfMonth]
        }
      },
      attributes: ['hours', 'billable']
    });

    const totalHours = timesheets.reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
    const billableHours = timesheets.filter(ts => ts.billable).reduce((sum, ts) => sum + parseFloat(ts.hours || 0), 0);
    const nonBillableHours = totalHours - billableHours;

    // Financial Summary
    const salesOrders = await SalesOrder.findAll({ attributes: ['amount'] });
    const purchaseOrders = await PurchaseOrder.findAll({ attributes: ['amount'] });
    const expenses = await Expense.findAll({ attributes: ['amount'] });

    const totalRevenue = salesOrders.reduce((sum, so) => sum + parseFloat(so.amount || 0), 0);
    const totalPurchases = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
    const totalProfit = totalRevenue - (totalPurchases + totalExpenses);

    // Recent Projects
    const recentProjects = await Project.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, as: 'manager', attributes: ['id', 'name'] }]
    });

    // Projects with Financial Data
    const projectsWithFinance = await Project.findAll({
      include: [
        { model: SalesOrder, as: 'salesOrders', attributes: ['amount'] },
        { model: PurchaseOrder, as: 'purchaseOrders', attributes: ['amount'] },
        { model: Expense, as: 'expenses', attributes: ['amount'] }
      ]
    });

    const projectFinancials = projectsWithFinance.map(project => {
      const revenue = project.salesOrders.reduce((sum, so) => sum + parseFloat(so.amount || 0), 0);
      const cost = project.purchaseOrders.reduce((sum, po) => sum + parseFloat(po.amount || 0), 0);
      const expense = project.expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      const profit = revenue - (cost + expense);

      return {
        id: project.id,
        name: project.name,
        revenue,
        cost: cost + expense,
        profit
      };
    }).filter(p => p.revenue > 0 || p.cost > 0); // Only projects with financial data

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalProjects,
          activeProjects,
          completedProjects,
          totalTasks,
          tasksDone,
          tasksInProgress,
          tasksNew,
          tasksBlocked,
          totalRevenue,
          totalCost: totalPurchases + totalExpenses,
          totalProfit,
          hoursLogged: Math.round(totalHours),
          billableHours: Math.round(billableHours),
          nonBillableHours: Math.round(nonBillableHours)
        },
        recentProjects,
        projectFinancials
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
};
