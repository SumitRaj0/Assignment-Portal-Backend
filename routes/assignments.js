const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { teacherOnly } = require('../middleware/role');
const {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  publishAssignment,
  completeAssignment,
  getSubmissions,
  getAnalytics,
  markSubmissionReviewed
} = require('../controllers/assignmentController');

router.use(auth);
router.use(teacherOnly);

router.get('/analytics', getAnalytics);
router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/', createAssignment);
router.put('/:id', updateAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/publish', publishAssignment);
router.post('/:id/complete', completeAssignment);
router.get('/:id/submissions', getSubmissions);
router.post('/submissions/:submissionId/review', markSubmissionReviewed);

module.exports = router;

