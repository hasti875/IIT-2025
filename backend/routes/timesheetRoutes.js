const express = require('express');
const router = express.Router();
const {
  getAllTimesheets,
  createTimesheet,
  updateTimesheet,
  deleteTimesheet,
  getTimesheetSummary
} = require('../controllers/timesheetController');
const { protect, authorize } = require('../middleware/auth');

// All routes are protected
router.use(protect);

// Summary route
router.get('/summary', getTimesheetSummary);

router
  .route('/')
  .get(getAllTimesheets)
  .post(createTimesheet);

router
  .route('/:id')
  .put(updateTimesheet)
  .delete(deleteTimesheet);

module.exports = router;
