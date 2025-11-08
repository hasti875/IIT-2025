const { sequelize } = require('./config/db');

const checkTables = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully\n');
    
    // List all tables
    const [results] = await sequelize.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);
    
    console.log('📋 Tables in database:');
    console.log('====================');
    results.forEach((row, index) => {
      console.log(`${index + 1}. ${row.table_name}`);
    });
    
    // Check if project_messages exists
    const hasProjectMessages = results.some(r => r.table_name === 'project_messages');
    
    if (hasProjectMessages) {
      console.log('\n✅ project_messages table EXISTS');
      
      // Get column details
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'project_messages'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📊 Columns in project_messages:');
      console.log('================================');
      columns.forEach((col) => {
        console.log(`  - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });
      
      // Check row count
      const [count] = await sequelize.query(`SELECT COUNT(*) as count FROM project_messages;`);
      console.log(`\n💬 Total messages: ${count[0].count}`);
      
    } else {
      console.log('\n❌ project_messages table DOES NOT EXIST');
      console.log('Run: node createMessageTable.js');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

checkTables();
