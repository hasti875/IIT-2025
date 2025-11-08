const { sequelize } = require('./config/db');

const fixDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ PostgreSQL connected successfully');
    
    // Add missing timestamp columns to project_teams if they don't exist
    try {
      await sequelize.query(`
        ALTER TABLE project_teams 
        ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
      `);
      console.log('✅ Added timestamp columns to project_teams');
    } catch (err) {
      console.log('⚠️  project_teams already has timestamps or doesn\'t exist');
    }
    
    // Create project_messages table
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS project_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        message TEXT NOT NULL,
        attachment_url VARCHAR(255),
        attachment_name VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ Created project_messages table');
    
    // Create indexes
    try {
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_project_messages_project_id ON project_messages(project_id);
      `);
      console.log('✅ Created project_id index');
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_project_messages_user_id ON project_messages(user_id);
      `);
      console.log('✅ Created user_id index');
      
      await sequelize.query(`
        CREATE INDEX IF NOT EXISTS idx_project_messages_created_at ON project_messages(created_at);
      `);
      console.log('✅ Created created_at index');
    } catch (err) {
      console.log('⚠️  Some indexes already exist:', err.message);
    }
    
    console.log('\n✅ Database migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
};

fixDatabase();
