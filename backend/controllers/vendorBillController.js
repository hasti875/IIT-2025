const { VendorBill, Project, PurchaseOrder } = require('../models');

// @desc    Get all vendor bills
// @route   GET /api/finance/vendorbills
// @access  Private
exports.getAllVendorBills = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const bills = await VendorBill.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'orderNumber', 'amount'] }
      ],
      order: [['billDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills
    });
  } catch (error) {
    console.error('Get vendor bills error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching vendor bills',
      error: error.message
    });
  }
};

// @desc    Create vendor bill
// @route   POST /api/finance/vendorbills
// @access  Private
exports.createVendorBill = async (req, res) => {
  try {
    const { projectId, purchaseOrderId, billNumber, vendorName, amount, description, billDate, dueDate } = req.body;

    if (!projectId || !billNumber || !vendorName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, bill number, vendor name, and amount are required'
      });
    }

    const bill = await VendorBill.create({
      projectId,
      purchaseOrderId,
      billNumber,
      vendorName,
      amount,
      description,
      billDate: billDate || new Date(),
      dueDate,
      status: 'Draft'
    });

    const billWithDetails = await VendorBill.findByPk(bill.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'orderNumber'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Vendor bill created successfully',
      data: billWithDetails
    });
  } catch (error) {
    console.error('Create vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating vendor bill',
      error: error.message
    });
  }
};

// @desc    Update vendor bill
// @route   PUT /api/finance/vendorbills/:id
// @access  Private
exports.updateVendorBill = async (req, res) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor bill not found'
      });
    }

    const { billNumber, vendorName, amount, description, billDate, dueDate, status } = req.body;

    await bill.update({
      billNumber: billNumber || bill.billNumber,
      vendorName: vendorName || bill.vendorName,
      amount: amount !== undefined ? amount : bill.amount,
      description: description !== undefined ? description : bill.description,
      billDate: billDate || bill.billDate,
      dueDate: dueDate !== undefined ? dueDate : bill.dueDate,
      status: status || bill.status
    });

    const updatedBill = await VendorBill.findByPk(bill.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: PurchaseOrder, as: 'purchaseOrder', attributes: ['id', 'orderNumber'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Vendor bill updated successfully',
      data: updatedBill
    });
  } catch (error) {
    console.error('Update vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating vendor bill',
      error: error.message
    });
  }
};

// @desc    Delete vendor bill
// @route   DELETE /api/finance/vendorbills/:id
// @access  Private
exports.deleteVendorBill = async (req, res) => {
  try {
    const bill = await VendorBill.findByPk(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: 'Vendor bill not found'
      });
    }

    await bill.destroy();

    res.status(200).json({
      success: true,
      message: 'Vendor bill deleted successfully'
    });
  } catch (error) {
    console.error('Delete vendor bill error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting vendor bill',
      error: error.message
    });
  }
};
