const { PurchaseOrder, Project } = require('../models');

// @desc    Get all purchase orders
// @route   GET /api/finance/purchaseorders
// @access  Private
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const purchaseOrders = await PurchaseOrder.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }],
      order: [['orderDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase orders',
      error: error.message
    });
  }
};

// @desc    Get single purchase order
// @route   GET /api/finance/purchaseorders/:id
// @access  Private
exports.getPurchaseOrderById = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    res.status(200).json({
      success: true,
      data: purchaseOrder
    });
  } catch (error) {
    console.error('Get purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching purchase order',
      error: error.message
    });
  }
};

// @desc    Create purchase order
// @route   POST /api/finance/purchaseorders
// @access  Private
exports.createPurchaseOrder = async (req, res) => {
  try {
    const { projectId, orderNumber, vendorName, amount, description, orderDate, status } = req.body;

    if (!projectId || !orderNumber || !vendorName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, order number, vendor name, and amount are required'
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

    const purchaseOrder = await PurchaseOrder.create({
      projectId,
      orderNumber,
      vendorName,
      amount,
      description,
      orderDate: orderDate || new Date(),
      status: status || 'Pending'
    });

    const purchaseOrderWithProject = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: purchaseOrderWithProject
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating purchase order',
      error: error.message
    });
  }
};

// @desc    Update purchase order
// @route   PUT /api/finance/purchaseorders/:id
// @access  Private
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    const { orderNumber, vendorName, amount, description, orderDate, status } = req.body;

    await purchaseOrder.update({
      orderNumber: orderNumber || purchaseOrder.orderNumber,
      vendorName: vendorName || purchaseOrder.vendorName,
      amount: amount !== undefined ? amount : purchaseOrder.amount,
      description: description !== undefined ? description : purchaseOrder.description,
      orderDate: orderDate || purchaseOrder.orderDate,
      status: status || purchaseOrder.status
    });

    const updatedPurchaseOrder = await PurchaseOrder.findByPk(purchaseOrder.id, {
      include: [{ model: Project, as: 'project', attributes: ['id', 'name'] }]
    });

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      data: updatedPurchaseOrder
    });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating purchase order',
      error: error.message
    });
  }
};

// @desc    Delete purchase order
// @route   DELETE /api/finance/purchaseorders/:id
// @access  Private
exports.deletePurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findByPk(req.params.id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: 'Purchase order not found'
      });
    }

    await purchaseOrder.destroy();

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting purchase order',
      error: error.message
    });
  }
};
