require('dotenv').config();
const { Timesheet, Project, Task, User } = require('./models');
const { sequelize } = require('./config/db');

const seedTimesheets = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected...');

    // Sync the Timesheet model with alter to add new columns if needed
    await Timesheet.sync({ alter: true });
    console.log('Timesheet table synchronized...');

    // Delete existing timesheets
    await Timesheet.destroy({ where: {} });
    console.log('Existing timesheets deleted...');

    // Get existing records
    const projects = await Project.findAll();
    const tasks = await Task.findAll();
    const users = await User.findAll();

    if (projects.length === 0 || tasks.length === 0 || users.length === 0) {
      console.log('Warning: No projects, tasks, or users found. Creating basic timesheet entries...');
    }

    // Find specific projects and tasks by name (with safe checks)
    const websiteProject = projects.find(p => p.name && p.name.includes('Website')) || projects[0];
    const mobileAppProject = projects.find(p => p.name && p.name.includes('Mobile')) || projects[1] || projects[0];
    const erpProject = projects.find(p => p.name && p.name.includes('ERP')) || projects[2] || projects[0];

    const frontendTask = tasks.find(t => t.title && (t.title.includes('Frontend') || t.title.includes('UI'))) || tasks[0];
    const apiTask = tasks.find(t => t.title && (t.title.includes('API') || t.title.includes('Integration'))) || tasks[1] || tasks[0];
    const databaseTask = tasks.find(t => t.title && t.title.includes('Database')) || tasks[2] || tasks[0];
    const testingTask = tasks.find(t => t.title && (t.title.includes('Testing') || t.title.includes('Test'))) || tasks[3] || tasks[0];

    const johnDoe = users[0];
    const janeSmith = users[1] || users[0];
    const bobJohnson = users[2] || users[0];

    // Create sample timesheets
    const timesheets = [
      {
        date: '2024-02-05',
        hours: 8,
        description: 'Working on frontend development',
        billable: true,
        userId: johnDoe?.id || null,
        projectId: websiteProject?.id || null,
        taskId: frontendTask?.id || null,
        employee: 'John Doe',
        projectName: 'Website Redesign',
        taskName: 'Frontend Development'
      },
      {
        date: '2024-02-05',
        hours: 6,
        description: 'API integration work',
        billable: true,
        userId: janeSmith?.id || null,
        projectId: mobileAppProject?.id || null,
        taskId: apiTask?.id || null,
        employee: 'Jane Smith',
        projectName: 'Mobile App',
        taskName: 'API Integration'
      },
      {
        date: '2024-02-06',
        hours: 7,
        description: 'Database design and optimization',
        billable: true,
        userId: bobJohnson?.id || null,
        projectId: erpProject?.id || null,
        taskId: databaseTask?.id || null,
        employee: 'Bob Johnson',
        projectName: 'ERP Integration',
        taskName: 'Database Design'
      },
      {
        date: '2024-02-06',
        hours: 4,
        description: 'Testing and bug fixes',
        billable: false,
        userId: johnDoe?.id || null,
        projectId: websiteProject?.id || null,
        taskId: testingTask?.id || null,
        employee: 'John Doe',
        projectName: 'Website Redesign',
        taskName: 'Testing'
      }
    ];

    await Timesheet.bulkCreate(timesheets);
    console.log('Sample timesheets created successfully!');
    console.log(`Created ${timesheets.length} timesheet entries`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding timesheets:', error);
    process.exit(1);
  }
};

seedTimesheets();
