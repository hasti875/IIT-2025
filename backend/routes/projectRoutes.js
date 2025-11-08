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

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getAllProjects)
  .post(authorize('ProjectManager', 'Admin'), createProject);

router
  .route('/:id')
  .get(getProjectById)
  .put(authorize('ProjectManager', 'Admin'), updateProject)
  .delete(authorize('Admin'), deleteProject);

// Team member routes
router
  .route('/:id/team')
  .get(getProjectTeam)
  .post(authorize('ProjectManager', 'Admin'), addTeamMember);

router
  .route('/:id/team/:userId')
  .delete(authorize('ProjectManager', 'Admin'), removeTeamMember);

// Project message routes
router
  .route('/:projectId/messages')
  .get(getProjectMessages)
  .post(createProjectMessage);

router
  .route('/:projectId/messages/:messageId')
  .delete(deleteProjectMessage);

module.exports = router;
