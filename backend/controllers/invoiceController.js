const { CustomerInvoice, Project, SalesOrder } = require('../models');

// @desc    Get all customer invoices
// @route   GET /api/finance/invoices
// @access  Private
exports.getAllInvoices = async (req, res) => {
  try {
    const { projectId, status } = req.query;
    const where = {};

    if (projectId) where.projectId = projectId;
    if (status) where.status = status;

    const invoices = await CustomerInvoice.findAll({
      where,
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: SalesOrder, as: 'salesOrder', attributes: ['id', 'orderNumber', 'amount'] }
      ],
      order: [['invoiceDate', 'DESC']]
    });

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching invoices',
      error: error.message
    });
  }
};

// @desc    Create customer invoice
// @route   POST /api/finance/invoices
// @access  Private
exports.createInvoice = async (req, res) => {
  try {
    const { projectId, salesOrderId, invoiceNumber, customerName, amount, description, invoiceDate, dueDate, milestone } = req.body;

    if (!projectId || !invoiceNumber || !customerName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Project ID, invoice number, customer name, and amount are required'
      });
    }

    const invoice = await CustomerInvoice.create({
      projectId,
      salesOrderId,
      invoiceNumber,
      customerName,
      amount,
      description,
      invoiceDate: invoiceDate || new Date(),
      dueDate,
      milestone,
      status: 'Draft'
    });

    const invoiceWithDetails = await CustomerInvoice.findByPk(invoice.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: SalesOrder, as: 'salesOrder', attributes: ['id', 'orderNumber'] }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Invoice created successfully',
      data: invoiceWithDetails
    });
  } catch (error) {
    console.error('Create invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating invoice',
      error: error.message
    });
  }
};

// @desc    Update customer invoice
// @route   PUT /api/finance/invoices/:id
// @access  Private
exports.updateInvoice = async (req, res) => {
  try {
    const invoice = await CustomerInvoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const { invoiceNumber, customerName, amount, description, invoiceDate, dueDate, status, milestone } = req.body;

    await invoice.update({
      invoiceNumber: invoiceNumber || invoice.invoiceNumber,
      customerName: customerName || invoice.customerName,
      amount: amount !== undefined ? amount : invoice.amount,
      description: description !== undefined ? description : invoice.description,
      invoiceDate: invoiceDate || invoice.invoiceDate,
      dueDate: dueDate !== undefined ? dueDate : invoice.dueDate,
      status: status || invoice.status,
      milestone: milestone !== undefined ? milestone : invoice.milestone
    });

    const updatedInvoice = await CustomerInvoice.findByPk(invoice.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: SalesOrder, as: 'salesOrder', attributes: ['id', 'orderNumber'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Invoice updated successfully',
      data: updatedInvoice
    });
  } catch (error) {
    console.error('Update invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating invoice',
      error: error.message
    });
  }
};

// @desc    Delete customer invoice
// @route   DELETE /api/finance/invoices/:id
// @access  Private
exports.deleteInvoice = async (req, res) => {
  try {
    const invoice = await CustomerInvoice.findByPk(req.params.id);

    if (!invoice) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    await invoice.destroy();

    res.status(200).json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    console.error('Delete invoice error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting invoice',
      error: error.message
    });
  }
};
