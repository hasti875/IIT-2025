require('dotenv').config();
const { Expense, Project, User } = require('./models');
const { sequelize } = require('./config/db');

const seedExpenses = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync the Expense model with alter to add new columns
    await Expense.sync({ alter: true });
    console.log('Expense table synchronized...');

    // Delete existing expenses
    await Expense.destroy({ where: {} });
    console.log('Existing expenses deleted...');

    // Get a project and user for foreign keys
    const project = await Project.findOne();
    const user = await User.findOne();

    // Create sample expenses
    const expenses = [
      {
        expenseNumber: 'EXP-001',
        expenseDate: '2024-02-01',
        category: 'Travel',
        description: 'Client meeting travel expenses',
        amount: 450.00,
        billable: true,
        status: 'Approved',
        employee: 'John Doe',
        projectId: project?.id || null,
        createdBy: user?.id || null,
        receipt: null
      },
      {
        expenseNumber: 'EXP-002',
        expenseDate: '2024-02-03',
        category: 'Software',
        description: 'Design software subscription',
        amount: 299.00,
        billable: true,
        status: 'Pending',
        employee: 'Jane Smith',
        projectId: project?.id || null,
        createdBy: user?.id || null,
        receipt: null
      },
      {
        expenseNumber: 'EXP-003',
        expenseDate: '2024-02-05',
        category: 'Other',
        description: 'Team lunch during sprint planning',
        amount: 85.00,
        billable: false,
        status: 'Approved',
        employee: 'Bob Johnson',
        projectId: project?.id || null,
        createdBy: user?.id || null,
        receipt: null
      },
      {
        expenseNumber: 'EXP-004',
        expenseDate: '2024-02-07',
        category: 'Equipment',
        description: 'New laptop for development',
        amount: 1200.00,
        billable: false,
        status: 'Rejected',
        employee: 'Alice Brown',
        projectId: project?.id || null,
        createdBy: user?.id || null,
        receipt: null
      }
    ];

    await Expense.bulkCreate(expenses);
    console.log('Sample expenses created successfully!');
    console.log(`Created ${expenses.length} expenses`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding expenses:', error);
    process.exit(1);
  }
};

seedExpenses();
