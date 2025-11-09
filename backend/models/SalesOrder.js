const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SalesOrder = sequelize.define('SalesOrder', {
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
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'order_number'
  },
  clientName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'client_name'
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
  orderDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'order_date'
  },
  status: {
    type: DataTypes.ENUM('Pending', 'Confirmed', 'Invoiced', 'Paid', 'Cancelled'),
    defaultValue: 'Pending'
  }
}, {
  timestamps: true,
  tableName: 'sales_orders',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['order_number']
    }
  ]
});

module.exports = SalesOrder;
