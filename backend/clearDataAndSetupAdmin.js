const { User, Project, Task, SalesOrder, PurchaseOrder, CustomerInvoice, VendorBill, Expense, Timesheet } = require('./models');

async function clearAndSetupAdmin() {
  try {
    console.log('🗑️  Clearing all data...\n');

    // Delete all data in correct order (respecting foreign keys)
    await Timesheet.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Timesheets');

    await Expense.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Expenses');

    await VendorBill.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Vendor Bills');

    await CustomerInvoice.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Customer Invoices');

    await PurchaseOrder.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Purchase Orders');

    await SalesOrder.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Sales Orders');

    await Task.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Tasks');

    await Project.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Projects');

    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log('✅ Cleared Users');

    console.log('\n📝 Creating Admin user...\n');

    // Create single Admin user (password will be hashed by the User model hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: '123456', // Will be hashed by beforeCreate hook
      role: 'Admin',
      hourlyRate: 0,
      isActive: true
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 LOGIN CREDENTIALS:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    admin@gmail.com');
    console.log('🔑 Password: 123456');
    console.log('👤 Role:     Admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 Next Steps:');
    console.log('1. Login with admin credentials');
    console.log('2. Create Projects from Projects page');
    console.log('3. Create Tasks and assign to users');
    console.log('4. Add Sales Orders, Purchase Orders');
    console.log('5. Generate Invoices and track Expenses');
    console.log('6. Invite team members and project managers\n');

    console.log('✨ System is now ready for dynamic data entry!');

  } catch (error) {
    console.error('❌ Error clearing data:', error);
  } finally {
    process.exit();
  }
}

clearAndSetupAdmin();
