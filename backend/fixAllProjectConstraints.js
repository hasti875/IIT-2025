const { sequelize } = require('./config/db');

async function fixAllConstraints() {
  try {
    console.log('Fixing all project-related foreign key constraints...\n');

    // Update all project_id constraints to CASCADE
    await sequelize.query(`
      -- Sales Orders
      ALTER TABLE sales_orders 
      DROP CONSTRAINT IF EXISTS sales_orders_project_id_fkey;
      
      ALTER TABLE sales_orders 
      ADD CONSTRAINT sales_orders_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;

      -- Purchase Orders
      ALTER TABLE purchase_orders 
      DROP CONSTRAINT IF EXISTS purchase_orders_project_id_fkey;
      
      ALTER TABLE purchase_orders 
      ADD CONSTRAINT purchase_orders_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;

      -- Expenses
      ALTER TABLE expenses 
      DROP CONSTRAINT IF EXISTS expenses_project_id_fkey;
      
      ALTER TABLE expenses 
      ADD CONSTRAINT expenses_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;

      -- Customer Invoices
      ALTER TABLE customer_invoices 
      DROP CONSTRAINT IF EXISTS customer_invoices_project_id_fkey;
      
      ALTER TABLE customer_invoices 
      ADD CONSTRAINT customer_invoices_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;

      -- Vendor Bills
      ALTER TABLE vendor_bills 
      DROP CONSTRAINT IF EXISTS vendor_bills_project_id_fkey;
      
      ALTER TABLE vendor_bills 
      ADD CONSTRAINT vendor_bills_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;

      -- Project Manager constraint (RESTRICT to prevent deletion)
      ALTER TABLE projects 
      DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
      
      ALTER TABLE projects 
      ADD CONSTRAINT projects_manager_id_fkey 
      FOREIGN KEY (manager_id) 
      REFERENCES users(id) 
      ON DELETE RESTRICT;
    `);

    console.log('✓ All constraints updated successfully!\n');
    console.log('Summary:');
    console.log('  ✓ Sales Orders → CASCADE delete');
    console.log('  ✓ Purchase Orders → CASCADE delete');
    console.log('  ✓ Expenses → CASCADE delete');
    console.log('  ✓ Customer Invoices → CASCADE delete');
    console.log('  ✓ Vendor Bills → CASCADE delete');
    console.log('  ✓ Project Manager → RESTRICT delete\n');
    console.log('When a project is deleted, all related records will be automatically deleted.');
    console.log('Project managers cannot be deleted if they manage any projects.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating constraints:', error);
    process.exit(1);
  }
}

fixAllConstraints();
