require('dotenv').config();
const { PurchaseOrder, Project, User } = require('./models');
const { sequelize } = require('./config/db');

const sampleOrders = [
  {
    orderNumber: 'PO-001',
    vendorName: 'CloudHost Inc',
    amount: 5000,
    orderDate: '2024-01-10',
    status: 'Confirmed',
    projectName: 'Website Redesign'
  },
  {
    orderNumber: 'PO-002',
    vendorName: 'Design Studio',
    amount: 12000,
    orderDate: '2024-01-18',
    status: 'Sent',
    projectName: 'Mobile App Development'
  },
  {
    orderNumber: 'PO-003',
    vendorName: 'Server Solutions',
    amount: 8500,
    orderDate: '2024-01-22',
    status: 'Draft',
    projectName: 'ERP Implementation'
  },
  {
    orderNumber: 'PO-004',
    vendorName: 'Marketing Agency',
    amount: 3000,
    orderDate: '2024-02-05',
    status: 'Received',
    projectName: 'Marketing Campaign'
  }
];

const seedPurchaseOrders = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Find projects
    const projects = await Project.findAll();
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.id;
    });

    // Delete existing purchase orders
    await PurchaseOrder.destroy({ where: {} });
    console.log('Existing purchase orders deleted...');

    // Create new purchase orders
    let created = 0;
    for (const orderData of sampleOrders) {
      const projectId = orderData.projectName ? projectMap[orderData.projectName] : null;
      
      await PurchaseOrder.create({
        orderNumber: orderData.orderNumber,
        vendorName: orderData.vendorName,
        amount: orderData.amount,
        orderDate: orderData.orderDate,
        status: orderData.status,
        projectId: projectId,
        description: `Purchase order for ${orderData.vendorName}`
      });
      created++;
    }

    console.log(`Sample purchase orders created successfully! Created ${created} orders`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding purchase orders:', error);
    process.exit(1);
  }
};

seedPurchaseOrders();
