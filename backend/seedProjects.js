require('dotenv').config();
const { Project, User } = require('./models');
const { sequelize } = require('./config/db');

const sampleProjects = [
  {
    name: 'Website Redesign',
    description: 'Acme Corp',
    budget: 45000,
    startDate: '2024-06-01',
    endDate: '2024-12-30',
    status: 'Active',
    progress: 75
  },
  {
    name: 'Mobile App Development',
    description: 'TechStart Inc',
    budget: 85000,
    startDate: '2024-08-01',
    endDate: '2025-01-15',
    status: 'Active',
    progress: 45
  },
  {
    name: 'ERP Implementation',
    description: 'Global Solutions',
    budget: 132000,
    startDate: '2024-03-01',
    endDate: '2025-02-28',
    status: 'Planning',
    progress: 30
  },
  {
    name: 'Marketing Campaign',
    description: 'Brand Co',
    budget: 135000,
    startDate: '2024-09-01',
    endDate: '2024-12-20',
    status: 'Active',
    progress: 90
  }
];

const seedProjects = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Find the first user to use as manager
    const user = await User.findOne();
    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    // Delete existing projects
    await Project.destroy({ where: {} });
    console.log('Existing projects deleted...');

    // Create new projects
    for (const projectData of sampleProjects) {
      await Project.create({
        ...projectData,
        managerId: user.id
      });
    }

    console.log('Sample projects created successfully!');
    console.log(`Created ${sampleProjects.length} projects`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding projects:', error);
    process.exit(1);
  }
};

seedProjects();
