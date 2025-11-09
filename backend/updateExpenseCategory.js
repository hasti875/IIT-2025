const { sequelize } = require('./config/db');

async function updateExpenseCategoryColumn() {
  try {
    console.log('Starting expense category column update...');
    
    // Drop the ENUM constraint and change column type to VARCHAR
    await sequelize.query(`
      ALTER TABLE expenses 
      ALTER COLUMN category TYPE VARCHAR(255) 
      USING category::text;
    `);
    
    console.log('✅ Successfully updated category column to VARCHAR');
    console.log('Custom categories are now allowed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating category column:', error);
    process.exit(1);
  }
}

updateExpenseCategoryColumn();
