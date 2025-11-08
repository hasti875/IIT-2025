const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Expense = sequelize.define('Expense', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  expenseNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'expense_number'
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
  category: {
    type: DataTypes.ENUM('Salary', 'Equipment', 'Travel', 'Software', 'Marketing', 'Meals', 'Other'),
    defaultValue: 'Other',
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  expenseDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'expense_date'
  },
  employee: {
    type: DataTypes.STRING,
    allowNull: true
  },
  billable: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  receipt: {
    type: DataTypes.STRING,
    allowNull: true
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'created_by',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Approved', 'Rejected', 'Reimbursed'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true,
  tableName: 'expenses',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['category']
    }
  ]
});

module.exports = Expense;
