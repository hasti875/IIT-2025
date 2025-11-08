const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllSalesOrders,
  getSalesOrderById,
  createSalesOrder,
  updateSalesOrder,
  deleteSalesOrder
} = require('../controllers/salesOrderController');
const {
  getAllPurchaseOrders,
  getPurchaseOrderById,
  createPurchaseOrder,
  updatePurchaseOrder,
  deletePurchaseOrder
} = require('../controllers/purchaseOrderController');
const {
  getAllExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
  updateExpenseApproval,
  generateExpenseReceipt
} = require('../controllers/expenseController');
const {
  getAllInvoices,
  createInvoice,
  updateInvoice,
  deleteInvoice
} = require('../controllers/invoiceController');
const {
  getAllVendorBills,
  createVendorBill,
  updateVendorBill,
  deleteVendorBill
} = require('../controllers/vendorBillController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Sales Orders Routes
router
  .route('/salesorders')
  .get(getAllSalesOrders)
  .post(authorize('ProjectManager', 'Admin', 'Finance'), createSalesOrder);

router
  .route('/salesorders/:id')
  .get(getSalesOrderById)
  .put(authorize('ProjectManager', 'Admin', 'Finance'), updateSalesOrder)
  .delete(authorize('Admin', 'Finance'), deleteSalesOrder);

// Purchase Orders Routes
router
  .route('/purchaseorders')
  .get(getAllPurchaseOrders)
  .post(authorize('ProjectManager', 'Admin', 'Finance'), createPurchaseOrder);

router
  .route('/purchaseorders/:id')
  .get(getPurchaseOrderById)
  .put(authorize('ProjectManager', 'Admin', 'Finance'), updatePurchaseOrder)
  .delete(authorize('Admin', 'Finance'), deletePurchaseOrder);

// Expenses Routes
router
  .route('/expenses')
  .get(getAllExpenses)
  .post(upload.single('receipt'), createExpense);

router
  .route('/expenses/:id')
  .get(getExpenseById)
  .put(authorize('ProjectManager', 'Admin', 'Finance'), updateExpense)
  .delete(authorize('Admin', 'Finance'), deleteExpense);

// Expense approval (Admin only)
router
  .route('/expenses/:id/approval')
  .put(authorize('Admin'), updateExpenseApproval);

// Expense receipt generation
router
  .route('/expenses/:id/receipt')
  .get(generateExpenseReceipt);

// Customer Invoices Routes
router
  .route('/invoices')
  .get(getAllInvoices)
  .post(authorize('ProjectManager', 'Admin', 'Finance'), createInvoice);

router
  .route('/invoices/:id')
  .put(authorize('ProjectManager', 'Admin', 'Finance'), updateInvoice)
  .delete(authorize('Admin', 'Finance'), deleteInvoice);

// Vendor Bills Routes
router
  .route('/vendorbills')
  .get(getAllVendorBills)
  .post(authorize('ProjectManager', 'Admin', 'Finance'), createVendorBill);

router
  .route('/vendorbills/:id')
  .put(authorize('ProjectManager', 'Admin', 'Finance'), updateVendorBill)
  .delete(authorize('Admin', 'Finance'), deleteVendorBill);

module.exports = router;
