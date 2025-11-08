const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Task = sequelize.define('Task', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id',
    references: {
      model: 'projects',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  assignedTo: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'assigned_to',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('New', 'In Progress', 'Blocked', 'Done'),
    defaultValue: 'New',
    allowNull: false
  },
  hoursLogged: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'hours_logged',
    validate: {
      min: 0
    }
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    field: 'estimated_hours',
    validate: {
      min: 0
    }
  },
  priority: {
    type: DataTypes.ENUM('Low', 'Medium', 'High', 'Critical'),
    defaultValue: 'Medium'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  }
}, {
  timestamps: true,
  tableName: 'tasks',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['assigned_to']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Task;
