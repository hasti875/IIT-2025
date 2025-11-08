const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Timesheet = sequelize.define('Timesheet', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  taskId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'task_id',
    references: {
      model: 'tasks',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'SET NULL'
  },
  employee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  projectName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'project_name'
  },
  taskName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'task_name'
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  hours: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
      max: 24
    }
  },
  billable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Submitted', 'Approved', 'Rejected'),
    defaultValue: 'Submitted'
  }
}, {
  timestamps: true,
  tableName: 'timesheets',
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['task_id']
    },
    {
      fields: ['project_id']
    },
    {
      fields: ['date']
    }
  ]
});

module.exports = Timesheet;
