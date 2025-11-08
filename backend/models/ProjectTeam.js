const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ProjectTeam = sequelize.define('ProjectTeam', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  projectId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'project_id'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Role in this specific project (optional)'
  }
}, {
  timestamps: true,
  tableName: 'project_teams',
  indexes: [
    {
      unique: true,
      fields: ['project_id', 'user_id']
    }
  ]
});

module.exports = ProjectTeam;
