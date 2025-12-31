const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { studentOnly } = require('../middleware/role');
const {
  getPublishedAssignments,
  submitAnswer,
  getMySubmission
} = require('../controllers/submissionController');

router.use(auth);
router.use(studentOnly);

router.get('/assignments', getPublishedAssignments);
router.post('/', submitAnswer);
router.get('/assignment/:assignmentId', getMySubmission);

module.exports = router;

