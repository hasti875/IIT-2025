const User = require('./User');
const Project = require('./Project');
const Task = require('./Task');
const SalesOrder = require('./SalesOrder');
const PurchaseOrder = require('./PurchaseOrder');
const Expense = require('./Expense');
const Timesheet = require('./Timesheet');
const CustomerInvoice = require('./CustomerInvoice');
const VendorBill = require('./VendorBill');
const OTP = require('./OTP');
const ProjectTeam = require('./ProjectTeam');
const ProjectMessage = require('./ProjectMessage');

// Define Associations

// User <-> Project (One-to-Many: User manages multiple projects)
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// User <-> Project (Many-to-Many: Project Team Members)
User.belongsToMany(Project, { through: ProjectTeam, foreignKey: 'userId', as: 'projects' });
Project.belongsToMany(User, { through: ProjectTeam, foreignKey: 'projectId', as: 'teamMembers' });

// User <-> Task (One-to-Many: User can be assigned to multiple tasks)
User.hasMany(Task, { foreignKey: 'assignedTo', as: 'assignedTasks' });
Task.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignee' });

// Project <-> Task (One-to-Many: Project has multiple tasks)
Project.hasMany(Task, { foreignKey: 'projectId', as: 'tasks', onDelete: 'CASCADE' });
Task.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> SalesOrder (One-to-Many: Project has multiple sales orders)
Project.hasMany(SalesOrder, { foreignKey: 'projectId', as: 'salesOrders', onDelete: 'CASCADE' });
SalesOrder.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> PurchaseOrder (One-to-Many: Project has multiple purchase orders)
Project.hasMany(PurchaseOrder, { foreignKey: 'projectId', as: 'purchaseOrders', onDelete: 'CASCADE' });
PurchaseOrder.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> Expense (One-to-Many: Project has multiple expenses)
Project.hasMany(Expense, { foreignKey: 'projectId', as: 'expenses', onDelete: 'CASCADE' });
Expense.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User <-> Expense (One-to-Many: User creates multiple expenses)
User.hasMany(Expense, { foreignKey: 'createdBy', as: 'createdExpenses' });
Expense.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User <-> Timesheet (One-to-Many: User has multiple timesheet entries)
User.hasMany(Timesheet, { foreignKey: 'userId', as: 'timesheets' });
Timesheet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Task <-> Timesheet (One-to-Many: Task has multiple timesheet entries)
Task.hasMany(Timesheet, { foreignKey: 'taskId', as: 'timesheets' });
Timesheet.belongsTo(Task, { foreignKey: 'taskId', as: 'task' });

// Project <-> Timesheet (One-to-Many: Project has multiple timesheet entries)
Project.hasMany(Timesheet, { foreignKey: 'projectId', as: 'timesheets', onDelete: 'CASCADE' });
Timesheet.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project <-> CustomerInvoice (One-to-Many: Project has multiple invoices)
Project.hasMany(CustomerInvoice, { foreignKey: 'projectId', as: 'invoices', onDelete: 'CASCADE' });
CustomerInvoice.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// SalesOrder <-> CustomerInvoice (One-to-Many: SalesOrder can have multiple invoices)
SalesOrder.hasMany(CustomerInvoice, { foreignKey: 'salesOrderId', as: 'invoices' });
CustomerInvoice.belongsTo(SalesOrder, { foreignKey: 'salesOrderId', as: 'salesOrder' });

// Project <-> VendorBill (One-to-Many: Project has multiple vendor bills)
Project.hasMany(VendorBill, { foreignKey: 'projectId', as: 'vendorBills', onDelete: 'CASCADE' });
VendorBill.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// PurchaseOrder <-> VendorBill (One-to-Many: PurchaseOrder can have multiple bills)
PurchaseOrder.hasMany(VendorBill, { foreignKey: 'purchaseOrderId', as: 'bills' });
VendorBill.belongsTo(PurchaseOrder, { foreignKey: 'purchaseOrderId', as: 'purchaseOrder' });

// Project <-> ProjectMessage (One-to-Many: Project has multiple messages)
Project.hasMany(ProjectMessage, { foreignKey: 'projectId', as: 'messages', onDelete: 'CASCADE' });
ProjectMessage.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User <-> ProjectMessage (One-to-Many: User sends multiple messages)
User.hasMany(ProjectMessage, { foreignKey: 'userId', as: 'messages' });
ProjectMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Project,
  Task,
  SalesOrder,
  PurchaseOrder,
  Expense,
  Timesheet,
  CustomerInvoice,
  VendorBill,
  OTP,
  ProjectTeam,
  ProjectMessage
};
