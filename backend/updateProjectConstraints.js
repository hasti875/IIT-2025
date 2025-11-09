const { sequelize } = require('./config/db');

async function updateConstraints() {
  try {
    console.log('Updating project deletion constraints...');

    // Drop existing foreign key constraints and recreate with CASCADE
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

      -- Update Project Manager constraint
      ALTER TABLE projects 
      DROP CONSTRAINT IF EXISTS projects_manager_id_fkey;
      
      ALTER TABLE projects 
      ADD CONSTRAINT projects_manager_id_fkey 
      FOREIGN KEY (manager_id) 
      REFERENCES users(id) 
      ON DELETE RESTRICT;
    `);

    console.log('✓ Constraints updated successfully!');
    console.log('✓ Sales orders will be deleted when project is deleted');
    console.log('✓ Purchase orders will be deleted when project is deleted');
    console.log('✓ Project managers cannot be deleted if they manage projects');
    
    process.exit(0);
  } catch (error) {
    console.error('Error updating constraints:', error);
    process.exit(1);
  }
}

updateConstraints();
