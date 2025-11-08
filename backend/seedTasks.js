require('dotenv').config();
const { Task, Project, User } = require('./models');
const { sequelize } = require('./config/db');

const sampleTasks = [
  // New Tasks
  { name: 'Performance Optimization', projectName: 'Website Redesign', status: 'New', priority: 'Medium' },
  { name: 'Cross-browser Testing', projectName: 'Website Redesign', status: 'New', priority: 'Low' },
  
  // In Progress Tasks
  { name: 'Implement Responsive Navigation', projectName: 'Website Redesign', status: 'In Progress', priority: 'High' },
  { name: 'Create Contact Form', projectName: 'Website Redesign', status: 'In Progress', priority: 'Medium' },
  { name: 'API Integration', projectName: 'Mobile App Development', status: 'In Progress', priority: 'High' },
  
  // Blocked Tasks
  { name: 'Third-party API Setup', projectName: 'Mobile App Development', status: 'Blocked', priority: 'High' },
  
  // Done Tasks
  { name: 'Design Homepage Mockup', projectName: 'Website Redesign', status: 'Done', priority: 'High' },
  { name: 'Database Schema Design', projectName: 'ERP Implementation', status: 'Done', priority: 'High' },
  { name: 'User Research', projectName: 'Marketing Campaign', status: 'Done', priority: 'Medium' }
];

const seedTasks = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Find user and projects
    const user = await User.findOne();
    if (!user) {
      console.error('No users found. Please create a user first.');
      return;
    }

    const projects = await Project.findAll();
    if (projects.length === 0) {
      console.error('No projects found. Please create projects first.');
      return;
    }

    // Create a map of project names to IDs
    const projectMap = {};
    projects.forEach(p => {
      projectMap[p.name] = p.id;
    });

    // Delete existing tasks
    await Task.destroy({ where: {} });
    console.log('Existing tasks deleted...');

    // Create new tasks
    let created = 0;
    for (const taskData of sampleTasks) {
      const projectId = projectMap[taskData.projectName];
      if (projectId) {
        await Task.create({
          name: taskData.name,
          projectId: projectId,
          assignedTo: user.id,
          status: taskData.status,
          priority: taskData.priority,
          description: `${taskData.name} for ${taskData.projectName}`,
          estimatedHours: Math.floor(Math.random() * 20) + 5
        });
        created++;
      }
    }

    console.log(`Sample tasks created successfully! Created ${created} tasks`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding tasks:', error);
    process.exit(1);
  }
};

seedTasks();
