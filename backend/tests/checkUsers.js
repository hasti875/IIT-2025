const { Sequelize } = require('sequelize');
const User = require('../models/User');

const sequelize = new Sequelize('oneflow', 'postgres', 'root', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected\n');
    
    const users = await User.findAll({ 
      attributes: ['id', 'email', 'role', 'name'] 
    });
    
    console.log('Existing users in database:');
    console.log('============================');
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}) - ${user.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
