const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addTeamMember,
  removeTeamMember,
  getProjectTeam
} = require('../controllers/projectController');
const {
  getProjectMessages,
  createProjectMessage,
  deleteProjectMessage
} = require('../controllers/projectMessageController');
const { protect, authorize } = require('../middleware/auth');

/**
 * PROJECT ROUTES
 * Manages projects, team members, and project chat messages
 * All routes require authentication (protect middleware)
 */

// ============================================
// Apply authentication to all project routes
// ============================================
router.use(protect);

// ============================================
// PROJECT CRUD ROUTES
// ============================================

// GET /api/projects - Get all projects
// Returns list of projects based on user role:
// - TeamMembers: Only projects with assigned tasks
// - Others: All projects
// Includes progress calculation (completed tasks / total tasks)

// POST /api/projects - Create new project
// Only ProjectManagers and Admins can create
// Auto-updates status to "Completed" if all tasks done
router
  .route('/')
  .get(getAllProjects)
  .post(authorize('ProjectManager', 'Admin'), createProject);

// GET /api/projects/:id - Get single project details
// Returns project with tasks, sales orders, expenses, etc.
// TeamMembers only see their assigned tasks

// PUT /api/projects/:id - Update project
// Only ProjectManagers and Admins
// Can update name, description, budget, status, etc.

// DELETE /api/projects/:id - Delete project
// ProjectManagers can delete their own projects
// Admins can delete any project
// Deletes all related data (tasks, team members, etc.)
router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('ProjectManager', 'Admin'), updateProject)
  .delete(authorize('ProjectManager', 'Admin'), deleteProject);

// ============================================
// TEAM MEMBER MANAGEMENT ROUTES
// ============================================

// GET /api/projects/:id/team - Get project team members
// Returns list of users assigned to this project
// Used in task assignment dropdown

// POST /api/projects/:id/team - Add team member to project
// Only ProjectManagers and Admins
// Assigns a user to work on this project
router
  .route('/:id/team')
  .get(getProjectTeam)
  .post(authorize('ProjectManager', 'Admin'), addTeamMember);

// DELETE /api/projects/:id/team/:userId - Remove team member
// Only ProjectManagers and Admins
// Removes user from project team
router
  .route('/:id/team/:userId')
  .delete(authorize('ProjectManager', 'Admin'), removeTeamMember);

// ============================================
// PROJECT CHAT/MESSAGES ROUTES
// ============================================

// GET /api/projects/:projectId/messages - Get all chat messages
// Returns messages for this project's chat room
// Ordered by time (oldest first)

// POST /api/projects/:projectId/messages - Send new message
// Creates a new chat message in project
// Automatically includes sender's user ID
router
  .route('/:projectId/messages')
  .get(getProjectMessages)
  .post(createProjectMessage);

// DELETE /api/projects/:projectId/messages/:messageId - Delete message
// Removes a chat message from project
router
  .route('/:projectId/messages/:messageId')
  .delete(deleteProjectMessage);

module.exports = router;
