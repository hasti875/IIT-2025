const { sequelize } = require('./config/db');

async function fixTimesheetConstraints() {
  try {
    console.log('🔧 Fixing timesheet foreign key constraints...\n');

    // Drop existing foreign key constraints
    await sequelize.query(`
      ALTER TABLE timesheets 
      DROP CONSTRAINT IF EXISTS timesheets_project_id_fkey;
    `);
    console.log('✅ Dropped old project_id foreign key');

    await sequelize.query(`
      ALTER TABLE timesheets 
      DROP CONSTRAINT IF EXISTS timesheets_task_id_fkey;
    `);
    console.log('✅ Dropped old task_id foreign key');

    // Add new foreign key constraints with CASCADE
    await sequelize.query(`
      ALTER TABLE timesheets 
      ADD CONSTRAINT timesheets_project_id_fkey 
      FOREIGN KEY (project_id) 
      REFERENCES projects(id) 
      ON DELETE CASCADE;
    `);
    console.log('✅ Added project_id foreign key with CASCADE');

    await sequelize.query(`
      ALTER TABLE timesheets 
      ADD CONSTRAINT timesheets_task_id_fkey 
      FOREIGN KEY (task_id) 
      REFERENCES tasks(id) 
      ON DELETE CASCADE;
    `);
    console.log('✅ Added task_id foreign key with CASCADE');

    console.log('\n✨ Foreign key constraints updated successfully!');
    console.log('   Now when a project is deleted, all its timesheets will be deleted automatically.');

  } catch (error) {
    console.error('❌ Error fixing constraints:', error.message);
  } finally {
    process.exit();
  }
}

fixTimesheetConstraints();
