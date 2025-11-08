const { ProjectMessage, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all messages for a project
// @route   GET /api/projects/:projectId/messages
// @access  Private
exports.getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const messages = await ProjectMessage.findAll({
      where: { projectId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages
    });
  } catch (error) {
    console.error('Get project messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project messages',
      error: error.message
    });
  }
};

// @desc    Create a new message in a project
// @route   POST /api/projects/:projectId/messages
// @access  Private
exports.createProjectMessage = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { message, attachmentUrl, attachmentName } = req.body;
    const userId = req.user.id;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const newMessage = await ProjectMessage.create({
      projectId,
      userId,
      message: message.trim(),
      attachmentUrl,
      attachmentName
    });

    // Fetch the message with user details
    const messageWithUser = await ProjectMessage.findByPk(newMessage.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: messageWithUser
    });
  } catch (error) {
    console.error('Create project message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating project message',
      error: error.message
    });
  }
};

// @desc    Delete a message
// @route   DELETE /api/projects/:projectId/messages/:messageId
// @access  Private (Own messages only or Admin/PM)
exports.deleteProjectMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const message = await ProjectMessage.findByPk(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Only allow deletion if user owns the message or is Admin/ProjectManager
    if (message.userId !== userId && userRole !== 'Admin' && userRole !== 'ProjectManager') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this message'
      });
    }

    await message.destroy();

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    console.error('Delete project message error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting project message',
      error: error.message
    });
  }
};
