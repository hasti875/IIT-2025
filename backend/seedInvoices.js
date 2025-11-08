require('dotenv').config();
const { CustomerInvoice, Project, SalesOrder } = require('./models');
const { sequelize } = require('./config/db');

const sampleInvoices = [
  {
    invoiceNumber: 'INV-001',
    customerName: 'Acme Corp',
    amount: 45000,
    invoiceDate: '2024-01-20',
    dueDate: '2024-02-20',
    status: 'Paid',
    projectName: 'Website Redesign'
  },
  {
    invoiceNumber: 'INV-002',
    customerName: 'Tech Solutions',
    amount: 32000,
    invoiceDate: '2024-01-25',
    dueDate: '2024-02-25',
    status: 'Sent',
    projectName: 'Mobile App Development'
  },
  {
    invoiceNumber: 'INV-003',
    customerName: 'Global Industries',
    amount: 78000,
    invoiceDate: '2024-02-01',
    dueDate: '2024-03-01',
    status: 'Draft',
    projectName: 'ERP Implementation'
  },
  {
    invoiceNumber: 'INV-004',
    customerName: 'StartupXYZ',
    amount: 15000,
    invoiceDate: '2024-02-05',
    dueDate: '2024-03-05',
    status: 'Overdue',
    projectName: 'Marketing Campaign'
  }
];

const seedInvoices = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Find projects
    const projects = await Project.findAll();
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.id;
    });

    // Delete existing invoices
    await CustomerInvoice.destroy({ where: {} });
    console.log('Existing invoices deleted...');

    // Create new invoices
    let created = 0;
    for (const invoiceData of sampleInvoices) {
      const projectId = projectMap[invoiceData.projectName];
      
      if (projectId) {
        await CustomerInvoice.create({
          invoiceNumber: invoiceData.invoiceNumber,
          customerName: invoiceData.customerName,
          amount: invoiceData.amount,
          invoiceDate: invoiceData.invoiceDate,
          dueDate: invoiceData.dueDate,
          status: invoiceData.status,
          projectId: projectId,
          description: `Invoice for ${invoiceData.customerName}`,
          milestone: 'Milestone 1'
        });
        created++;
      }
    }

    console.log(`Sample invoices created successfully! Created ${created} invoices`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding invoices:', error);
    process.exit(1);
  }
};

seedInvoices();
