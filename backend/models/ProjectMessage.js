const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProjectMessage = sequelize.define('ProjectMessage', {
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
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  attachmentUrl: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'attachment_url'
  },
  attachmentName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'attachment_name'
  }
}, {
  timestamps: true,
  tableName: 'project_messages',
  indexes: [
    {
      fields: ['project_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

module.exports = ProjectMessage;
