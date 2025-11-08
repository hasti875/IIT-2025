const { Project, SalesOrder, PurchaseOrder, User } = require('./models');

async function addSampleFinancialData() {
  try {
    console.log('💰 Adding Sample Financial Data\n');

    // Get the first project
    const project = await Project.findOne();
    
    if (!project) {
      console.log('❌ No projects found. Please create a project first.');
      process.exit(1);
    }

    // Get the first user (admin)
    const user = await User.findOne();

    console.log(`📋 Adding financial data to project: ${project.name}\n`);

    // Create a Sales Order (Revenue)
    const salesOrder = await SalesOrder.create({
      orderNumber: `SO-${Date.now()}`,
      projectId: project.id,
      client: project.client || 'Test Client',
      amount: 50000,
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      status: 'Approved',
      items: [
        {
          description: 'Software Development Services',
          quantity: 1,
          rate: 50000,
          amount: 50000
        }
      ],
      createdBy: user.id
    });
    console.log(`✅ Created Sales Order: ${salesOrder.orderNumber} - Rs. ${salesOrder.amount}`);

    // Create a Purchase Order (Cost)
    const purchaseOrder = await PurchaseOrder.create({
      orderNumber: `PO-${Date.now()}`,
      projectId: project.id,
      vendor: 'Tech Vendor Inc.',
      amount: 15000,
      orderDate: new Date(),
      deliveryDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
      status: 'Approved',
      items: [
        {
          description: 'Software Licenses',
          quantity: 10,
          rate: 1500,
          amount: 15000
        }
      ],
      createdBy: user.id
    });
    console.log(`✅ Created Purchase Order: ${purchaseOrder.orderNumber} - Rs. ${purchaseOrder.amount}`);

    console.log('\n📊 Updated Financial Summary:');
    console.log(`   Revenue: Rs. ${salesOrder.amount}`);
    console.log(`   Cost: Rs. ${purchaseOrder.amount + 10}`); // +10 for existing expense
    console.log(`   Profit: Rs. ${salesOrder.amount - (purchaseOrder.amount + 10)}`);

    console.log('\n✅ Sample data added! Refresh the Analytics page to see the changes.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

addSampleFinancialData();
