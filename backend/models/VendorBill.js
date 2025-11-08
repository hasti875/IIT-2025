const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const VendorBill = sequelize.define('VendorBill', {
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
  purchaseOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'purchase_order_id',
    references: {
      model: 'purchase_orders',
      key: 'id'
    }
  },
  billNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'bill_number'
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
  billDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'bill_date'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Received', 'Paid', 'Overdue', 'Cancelled'),
    defaultValue: 'Draft'
  }
}, {
  timestamps: true,
  tableName: 'vendor_bills',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['bill_number']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = VendorBill;
