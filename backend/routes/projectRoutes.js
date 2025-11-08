const express = require('express');
const router = express.Router();
const {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject
} = require('../controllers/projectController');
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

module.exports = router;
