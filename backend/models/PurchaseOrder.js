const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PurchaseOrder = sequelize.define('PurchaseOrder', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  orderNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'order_number'
  },
  vendorName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'vendor_name'
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
    type: DataTypes.ENUM('Draft', 'Sent', 'Confirmed', 'Received', 'Cancelled'),
    defaultValue: 'Draft'
  }
}, {
  timestamps: true,
  tableName: 'purchase_orders',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['order_number']
    }
  ]
});

module.exports = PurchaseOrder;
