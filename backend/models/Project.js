const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  managerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'manager_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  budget: {
    type: DataTypes.DECIMAL(15, 2),
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  startDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'end_date'
  },
  status: {
    type: DataTypes.ENUM('Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'),
    defaultValue: 'Planning',
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 100
    }
  }
}, {
  timestamps: true,
  tableName: 'projects',
  indexes: [
    {
      fields: ['manager_id']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = Project;
