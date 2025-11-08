require('dotenv').config();
const { SalesOrder, Project, User } = require('./models');
const { sequelize } = require('./config/db');

const sampleOrders = [
  {
    orderNumber: 'SO-001',
    clientName: 'Acme Corp',
    amount: 45000,
    orderDate: '2024-01-15',
    status: 'Confirmed',
    projectName: 'Website Redesign'
  },
  {
    orderNumber: 'SO-002',
    clientName: 'Tech Solutions',
    amount: 32000,
    orderDate: '2024-01-20',
    status: 'Pending',
    projectName: 'Mobile App Development'
  },
  {
    orderNumber: 'SO-003',
    clientName: 'Global Industries',
    amount: 78000,
    orderDate: '2024-01-25',
    status: 'Invoiced',
    projectName: 'ERP Implementation'
  },
  {
    orderNumber: 'SO-004',
    clientName: 'StartupXYZ',
    amount: 15000,
    orderDate: '2024-02-01',
    status: 'Confirmed',
    projectName: 'Marketing Campaign'
  }
];

const seedSalesOrders = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Find user
    const user = await User.findOne();
    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    // Find projects
    const projects = await Project.findAll();
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.id;
    });

    // Delete existing sales orders
    await SalesOrder.destroy({ where: {} });
    console.log('Existing sales orders deleted...');

    // Create new sales orders
    let created = 0;
    for (const orderData of sampleOrders) {
      const projectId = orderData.projectName ? projectMap[orderData.projectName] : null;
      
      await SalesOrder.create({
        orderNumber: orderData.orderNumber,
        clientName: orderData.clientName,
        amount: orderData.amount,
        orderDate: orderData.orderDate,
        status: orderData.status,
        projectId: projectId,
        description: `Sales order for ${orderData.clientName}`
      });
      created++;
    }

    console.log(`Sample sales orders created successfully! Created ${created} orders`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding sales orders:', error);
    process.exit(1);
  }
};

seedSalesOrders();
