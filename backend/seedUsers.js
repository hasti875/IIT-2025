const { User } = require('./models');
const bcrypt = require('bcryptjs');

async function seedUsers() {
  try {
    console.log('🌱 Seeding users...');

    // Check if users already exist
    const existingUsers = await User.count();
    if (existingUsers > 0) {
      console.log('⚠️  Users already exist. Skipping seed...');
      console.log('\nExisting users:');
      const users = await User.findAll({ attributes: ['email', 'role', 'name'] });
      users.forEach(u => console.log(`  - ${u.email} (${u.role}) - ${u.name}`));
      return;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create users with different roles
    const users = [
      {
        name: 'Admin User',
        email: 'admin@oneflow.com',
        password: hashedPassword,
        role: 'Admin',
        hourlyRate: 100.00,
        isActive: true
      },
      {
        name: 'Project Manager',
        email: 'pm@oneflow.com',
        password: hashedPassword,
        role: 'ProjectManager',
        hourlyRate: 75.00,
        isActive: true
      },
      {
        name: 'Team Member',
        email: 'team@oneflow.com',
        password: hashedPassword,
        role: 'TeamMember',
        hourlyRate: 50.00,
        isActive: true
      },
      {
        name: 'John Developer',
        email: 'john@oneflow.com',
        password: hashedPassword,
        role: 'TeamMember',
        hourlyRate: 55.00,
        isActive: true
      }
    ];

    await User.bulkCreate(users);

    console.log('✅ Users seeded successfully!');
    console.log('\n📧 Login credentials:');
    console.log('  Admin:');
    console.log('    Email: admin@oneflow.com');
    console.log('    Password: password123');
    console.log('    Role: Admin (Full Access)');
    console.log('\n  Project Manager:');
    console.log('    Email: pm@oneflow.com');
    console.log('    Password: password123');
    console.log('    Role: Project Manager (6 nav items)');
    console.log('\n  Team Member:');
    console.log('    Email: team@oneflow.com');
    console.log('    Password: password123');
    console.log('    Role: Team Member (4 nav items)');
    console.log('\n  Team Member 2:');
    console.log('    Email: john@oneflow.com');
    console.log('    Password: password123');
    console.log('    Role: Team Member');

  } catch (error) {
    console.error('❌ Error seeding users:', error);
  } finally {
    process.exit();
  }
}

seedUsers();
