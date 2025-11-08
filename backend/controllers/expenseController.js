const { Expense, Project, User } = require('../models');

// @desc    Get all expenses
// @route   GET /api/finance/expenses
// @access  Private
exports.getAllExpenses = async (req, res) => {
  try {
    const { projectId, category, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (category) where.category = category;
    if (status) where.status = status;

    const expenses = await Expense.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ],
      order: [['expenseDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expenses',
      error: error.message
    });
  }
};

// @desc    Get single expense
// @route   GET /api/finance/expenses/:id
// @access  Private
exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.status(200).json({
      success: true,
      data: expense
    });
  } catch (error) {
    console.error('Get expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching expense',
      error: error.message
    });
  }
};

// @desc    Create expense
// @route   POST /api/finance/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { projectId, category, amount, description, expenseDate, status } = req.body;

    if (!projectId || !category || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, category, and amount are required'
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

    const expense = await Expense.create({
      projectId,
      category,
      amount,
      description,
      expenseDate: expenseDate || new Date(),
      createdBy: req.user.id,
      status: status || 'Pending'
    });

    const expenseWithDetails = await Expense.findByPk(expense.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: expenseWithDetails
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating expense',
      error: error.message
    });
  }
};

// @desc    Update expense
// @route   PUT /api/finance/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    const { category, amount, description, expenseDate, status } = req.body;

    await expense.update({
      category: category || expense.category,
      amount: amount !== undefined ? amount : expense.amount,
      description: description !== undefined ? description : expense.description,
      expenseDate: expenseDate || expense.expenseDate,
      status: status || expense.status
    });

    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      data: updatedExpense
    });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense',
      error: error.message
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/finance/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.destroy();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting expense',
      error: error.message
    });
  }
};
