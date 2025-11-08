const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

// GET routes - allow ProjectManager and Admin
router.get('/', authorize('ProjectManager', 'Admin'), userController.getAllUsers);
router.get('/:id', authorize('ProjectManager', 'Admin'), userController.getUserById);

// Write operations - Admin only
router.post('/', authorize('Admin'), userController.createUser);
router.put('/:id', authorize('Admin'), userController.updateUser);
router.delete('/:id', authorize('Admin'), userController.deleteUser);

module.exports = router;
