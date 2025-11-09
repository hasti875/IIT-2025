const { Expense, Project, User, ProjectTeam } = require('../models');
const PDFDocument = require('pdfkit');

// Helper function to generate unique expense number
const generateExpenseNumber = async () => {
  const lastExpense = await Expense.findOne({
    order: [['createdAt', 'DESC']]
  });

  if (!lastExpense || !lastExpense.expenseNumber) {
    return 'EXP-001';
  }

  const lastNumber = parseInt(lastExpense.expenseNumber.split('-')[1]);
  const newNumber = lastNumber + 1;
  return `EXP-${String(newNumber).padStart(3, '0')}`;
};

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

    // If user is a TeamMember, filter expenses to show only from assigned projects
    if (req.user.role === 'TeamMember') {
      // Get all projects assigned to this team member
      const assignedProjects = await ProjectTeam.findAll({
        where: { userId: req.user.id },
        attributes: ['projectId']
      });

      const projectIds = assignedProjects.map(pt => pt.projectId);

      // Add projectId filter - only show expenses from assigned projects
      if (projectIds.length > 0) {
        where.projectId = projectIds;
      } else {
        // If team member has no assigned projects, return empty array
        return res.status(200).json({
          success: true,
          count: 0,
          data: []
        });
      }
    }

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
    const { projectId, category, amount, description, expenseDate, status, billable } = req.body;

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

    // Generate unique expense number
    const expenseNumber = await generateExpenseNumber();

    // Get uploaded file path if exists
    const receipt = req.file ? `/uploads/receipts/${req.file.filename}` : null;

    const expense = await Expense.create({
      expenseNumber,
      projectId,
      category,
      amount,
      description,
      expenseDate: expenseDate || new Date(),
      createdBy: req.user.id,
      status: status || 'Pending',
      billable: billable || false,
      receipt: receipt
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

// @desc    Approve or reject expense
// @route   PUT /api/finance/expenses/:id/approval
// @access  Private (Admin only)
exports.updateExpenseApproval = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Approved or Rejected'
      });
    }

    const expense = await Expense.findByPk(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    await expense.update({ status });

    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    res.status(200).json({
      success: true,
      message: `Expense ${status.toLowerCase()} successfully`,
      data: updatedExpense
    });
  } catch (error) {
    console.error('Update expense approval error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating expense approval',
      error: error.message
    });
  }
};

// @desc    Generate and download expense receipt
// @route   GET /api/finance/expenses/:id/receipt
// @access  Private
exports.generateExpenseReceipt = async (req, res) => {
  try {
    console.log('Generating receipt for expense ID:', req.params.id);
    
    const expense = await Expense.findByPk(req.params.id, {
      include: [
        { model: Project, as: 'project', attributes: ['id', 'name', 'description'] },
        { model: User, as: 'creator', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!expense) {
      console.log('Expense not found');
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    console.log('Expense found:', expense.expenseNumber);
    console.log('Creating PDF document...');

    // Create a PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=expense-receipt-${expense.expenseNumber}.pdf`);
    
    console.log('Headers set, starting PDF generation...');
    
    // Handle errors during PDF generation
    doc.on('error', (err) => {
      console.error('PDF generation error:', err);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          message: 'Error generating PDF',
          error: err.message
        });
      }
    });
    
    // Pipe the PDF to the response
    doc.pipe(res);

    // Company header
    doc.fontSize(20).font('Helvetica-Bold').text('OneFlow', { align: 'center' });
    doc.fontSize(10).font('Helvetica').text('Plan to Bill', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(16).font('Helvetica-Bold').text('EXPENSE RECEIPT', { align: 'center' });
    doc.moveDown(1.5);

    // Receipt details box
    const startY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold').text('Receipt Details', 50, startY);
    doc.moveDown(0.5);
    
    // Receipt information
    const leftCol = 50;
    const rightCol = 320;
    let currentY = doc.y;

    doc.font('Helvetica-Bold').fontSize(9).text('Expense Number:', leftCol, currentY);
    doc.font('Helvetica').text(expense.expenseNumber, leftCol + 120, currentY);
    
    currentY += 20;
    doc.font('Helvetica-Bold').text('Date:', leftCol, currentY);
    doc.font('Helvetica').text(
      new Date(expense.expenseDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      leftCol + 120,
      currentY
    );

    currentY += 20;
    doc.font('Helvetica-Bold').text('Status:', leftCol, currentY);
    doc.font('Helvetica').text(expense.status, leftCol + 120, currentY);

    // Right column
    currentY = doc.y - 40;
    doc.font('Helvetica-Bold').text('Submitted By:', rightCol, currentY);
    doc.font('Helvetica').text(expense.creator?.name || 'N/A', rightCol + 90, currentY);

    currentY += 20;
    doc.font('Helvetica-Bold').text('Email:', rightCol, currentY);
    doc.font('Helvetica').text(expense.creator?.email || 'N/A', rightCol + 90, currentY);

    currentY += 20;
    doc.font('Helvetica-Bold').text('Category:', rightCol, currentY);
    doc.font('Helvetica').text(expense.category, rightCol + 90, currentY);

    doc.moveDown(2);

    // Horizontal line
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Project details
    if (expense.project) {
      doc.fontSize(10).font('Helvetica-Bold').text('Project Information', 50);
      doc.moveDown(0.5);
      
      currentY = doc.y;
      doc.font('Helvetica-Bold').fontSize(9).text('Project Name:', leftCol, currentY);
      doc.font('Helvetica').text(expense.project.name, leftCol + 120, currentY);
      
      if (expense.project.description) {
        currentY += 20;
        doc.font('Helvetica-Bold').text('Description:', leftCol, currentY);
        doc.font('Helvetica').text(
          expense.project.description.substring(0, 50) + (expense.project.description.length > 50 ? '...' : ''),
          leftCol + 120,
          currentY,
          { width: 350 }
        );
      }
      
      doc.moveDown(1.5);
    }

    // Horizontal line
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Expense details
    doc.fontSize(10).font('Helvetica-Bold').text('Expense Details', 50);
    doc.moveDown(0.5);

    if (expense.description) {
      doc.font('Helvetica-Bold').fontSize(9).text('Description:', 50);
      doc.font('Helvetica').text(expense.description, 50, doc.y, { 
        width: 500,
        align: 'left'
      });
      doc.moveDown(1);
    }

    currentY = doc.y;
    doc.font('Helvetica-Bold').text('Billable:', leftCol, currentY);
    doc.font('Helvetica').text(expense.billable ? 'Yes' : 'No', leftCol + 120, currentY);

    doc.moveDown(2);

    // Horizontal line
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);

    // Amount section - highlighted
    doc.rect(50, doc.y, 500, 60).fillAndStroke('#f3f4f6', '#e5e7eb');
    
    const amountY = doc.y + 20;
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('Total Amount:', 60, amountY);
    doc.fontSize(20).font('Helvetica-Bold').text(
      `Rs. ${parseFloat(expense.amount).toFixed(2)}`,
      400,
      amountY,
      { align: 'right', width: 140 }
    );

    doc.moveDown(4);

    // Footer
    doc.fontSize(8).font('Helvetica').fillColor('#666666').text(
      `This is a computer-generated receipt and does not require a signature.`,
      50,
      doc.page.height - 100,
      { align: 'center', width: 500 }
    );

    doc.text(
      `Generated on ${new Date().toLocaleDateString('en-US')} at ${new Date().toLocaleTimeString('en-US')}`,
      50,
      doc.page.height - 80,
      { align: 'center', width: 500 }
    );

    // Finalize the PDF
    console.log('Finalizing PDF...');
    doc.end();
    console.log('PDF generation completed successfully');
  } catch (error) {
    console.error('Generate receipt error:', error);
    console.error('Error stack:', error.stack);
    // Only send JSON if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Error generating receipt',
        error: error.message
      });
    } else {
      // If headers were sent, end the response
      res.end();
    }
  }
};