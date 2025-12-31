const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');

const getPublishedAssignments = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const assignments = await Assignment.find({ status: 'Published' })
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(pageSize);

    const total = await Assignment.countDocuments({ status: 'Published' });

    const assignmentIds = assignments.map(a => a._id);
    const submissions = await Submission.find({
      studentId: req.user._id,
      assignmentId: { $in: assignmentIds }
    });

    const submittedIds = new Set(submissions.map(s => s.assignmentId.toString()));

    const assignmentsWithSubmissionStatus = assignments.map(assignment => ({
      ...assignment.toObject(),
      isSubmitted: submittedIds.has(assignment._id.toString()),
      submittedAt: submissions.find(s => s.assignmentId.toString() === assignment._id.toString())?.submittedAt
    }));

    res.json({
      assignments: assignmentsWithSubmissionStatus,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
        itemsPerPage: pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching published assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

const submitAnswer = async (req, res) => {
  try {
    const { assignmentId, answer } = req.body;

    if (!assignmentId || !answer) {
      return res.status(400).json({ message: 'Assignment ID and answer required' });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.status !== 'Published') {
      return res.status(400).json({ message: 'Assignment not published' });
    }

    if (new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Deadline passed' });
    }

    const existingSubmission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    });

    if (existingSubmission) {
      return res.status(400).json({ message: 'Already submitted' });
    }

    const submission = new Submission({
      assignmentId,
      studentId: req.user._id,
      answer
    });

    await submission.save();
    await submission.populate('assignmentId', 'title description dueDate');
    await submission.populate('studentId', 'name email');

    res.status(201).json(submission);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already submitted this assignment' });
    }
    console.error('Submit answer error:', error);
    res.status(500).json({ message: 'Error submitting answer' });
  }
};

const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    })
      .populate('assignmentId', 'title description dueDate status')
      .populate('studentId', 'name email');

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    res.json(submission);
  } catch (error) {
    console.error('Get submission error:', error);
    res.status(500).json({ message: 'Error fetching submission' });
  }
};

module.exports = {
  getPublishedAssignments,
  submitAnswer,
  getMySubmission
};

