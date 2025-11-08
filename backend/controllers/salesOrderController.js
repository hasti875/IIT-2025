const { SalesOrder, Project } = require('../models');

// @desc    Get all sales orders
// @route   GET /api/finance/salesorders
// @access  Private
exports.getAllSalesOrders = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const salesOrders = await SalesOrder.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      order: [['orderDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: salesOrders.length,
      data: salesOrders
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales orders',
      error: error.message
    });
  }
};

// @desc    Get single sales order
// @route   GET /api/finance/salesorders/:id
// @access  Private
exports.getSalesOrderById = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: salesOrder
    });
  } catch (error) {
    console.error('Get sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sales order',
      error: error.message
    });
  }
};

// @desc    Create sales order
// @route   POST /api/finance/salesorders
// @access  Private
exports.createSalesOrder = async (req, res) => {
  try {
    const { projectId, orderNumber, clientName, amount, description, orderDate, status } = req.body;

    if (!projectId || !orderNumber || !clientName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, order number, client name, and amount are required'
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

    const salesOrder = await SalesOrder.create({
      projectId,
      orderNumber,
      clientName,
      amount,
      description,
      orderDate: orderDate || new Date(),
      status: status || 'Pending'
    });

    const salesOrderWithProject = await SalesOrder.findByPk(salesOrder.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Sales order created successfully',
      data: salesOrderWithProject
    });
  } catch (error) {
    console.error('Create sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating sales order',
      error: error.message
    });
  }
};

// @desc    Update sales order
// @route   PUT /api/finance/salesorders/:id
// @access  Private
exports.updateSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    const { orderNumber, clientName, amount, description, orderDate, status } = req.body;

    await salesOrder.update({
      orderNumber: orderNumber || salesOrder.orderNumber,
      clientName: clientName || salesOrder.clientName,
      amount: amount !== undefined ? amount : salesOrder.amount,
      description: description !== undefined ? description : salesOrder.description,
      orderDate: orderDate || salesOrder.orderDate,
      status: status || salesOrder.status
    });

    const updatedSalesOrder = await SalesOrder.findByPk(salesOrder.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Sales order updated successfully',
      data: updatedSalesOrder
    });
  } catch (error) {
    console.error('Update sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sales order',
      error: error.message
    });
  }
};

// @desc    Delete sales order
// @route   DELETE /api/finance/salesorders/:id
// @access  Private
exports.deleteSalesOrder = async (req, res) => {
  try {
    const salesOrder = await SalesOrder.findByPk(req.params.id);

    if (!salesOrder) {
      return res.status(404).json({
        success: false,
        message: 'Sales order not found'
      });
    }

    await salesOrder.destroy();

    res.status(200).json({
      success: true,
      message: 'Sales order deleted successfully'
    });
  } catch (error) {
    console.error('Delete sales order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sales order',
      error: error.message
    });
  }
};
