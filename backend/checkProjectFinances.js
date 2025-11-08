const { Project, SalesOrder, PurchaseOrder, Expense } = require('./models');

async function checkProjectFinances() {
  try {
    console.log('📊 Checking Project Financial Data\n');

    const projects = await Project.findAll({
      include: [
        { model: SalesOrder, as: 'salesOrders' },
        { model: PurchaseOrder, as: 'purchaseOrders' },
        { model: Expense, as: 'expenses' }
      ]
    });

    projects.forEach(project => {
      console.log(`\n🏢 Project: ${project.name} (${project.id})`);
      console.log('━'.repeat(60));
      
      const salesOrders = project.salesOrders || [];
      const purchaseOrders = project.purchaseOrders || [];
      const expenses = project.expenses || [];

      console.log(`\n💰 Sales Orders (${salesOrders.length}):`);
      salesOrders.forEach(so => {
        console.log(`   - ${so.orderNumber}: Rs. ${so.amount}`);
      });
      const totalRevenue = salesOrders.reduce((sum, so) => sum + parseFloat(so.amount || 0), 0);
      console.log(`   Total Revenue: Rs. ${totalRevenue}`);

      console.log(`\n🛒 Purchase Orders (${purchaseOrders.length}):`);
      purchaseOrders.forEach(po => {
        console.log(`   - ${po.orderNumber}: Rs. ${po.amount}`);
      });
      const totalPO = purchaseOrders.reduce((sum, po) => sum + parseFloat(po.amount || 0), 0);
      console.log(`   Total Purchase: Rs. ${totalPO}`);

      console.log(`\n💸 Expenses (${expenses.length}):`);
      expenses.forEach(exp => {
        console.log(`   - ${exp.expenseNumber}: Rs. ${exp.amount}`);
      });
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);
      console.log(`   Total Expenses: Rs. ${totalExpenses}`);

      console.log(`\n📈 Summary:`);
      console.log(`   Revenue: Rs. ${totalRevenue}`);
      console.log(`   Cost: Rs. ${totalPO + totalExpenses}`);
      console.log(`   Profit: Rs. ${totalRevenue - (totalPO + totalExpenses)}`);
    });

    console.log('\n\n✅ Analysis Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkProjectFinances();
