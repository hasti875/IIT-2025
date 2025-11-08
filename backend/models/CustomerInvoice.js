const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const CustomerInvoice = sequelize.define('CustomerInvoice', {
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
  salesOrderId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'sales_order_id',
    references: {
      model: 'sales_orders',
      key: 'id'
    }
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'invoice_number'
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'customer_name'
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
  invoiceDate: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'invoice_date'
  },
  dueDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'due_date'
  },
  status: {
    type: DataTypes.ENUM('Draft', 'Sent', 'Paid', 'Overdue', 'Cancelled'),
    defaultValue: 'Draft'
  },
  milestone: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  tableName: 'customer_invoices',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['invoice_number']
    },
    {
      fields: ['status']
    }
  ]
});

module.exports = CustomerInvoice;
