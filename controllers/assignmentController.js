const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const getAssignments = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { createdBy: req.user._id };
    
    if (status) {
      filter.status = status;
    }

    const pageNumber = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);
    const skip = (pageNumber - 1) * pageSize;

    const assignments = await Assignment.find(filter)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(pageSize);

    const total = await Assignment.countDocuments(filter);

    res.json({
      assignments,
      pagination: {
        currentPage: pageNumber,
        totalPages: Math.ceil(total / pageSize),
        totalItems: total,
        itemsPerPage: pageSize
      }
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({ message: 'Error fetching assignments' });
  }
};

const getAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    res.json(assignment);
  } catch (error) {
    console.error('Get assignment error:', error);
    res.status(500).json({ message: 'Error fetching assignment' });
  }
};

const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate } = req.body;

    if (!title || !description || !dueDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const assignment = new Assignment({
      title,
      description,
      dueDate,
      status: 'Draft',
      createdBy: req.user._id
    });

    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    res.status(201).json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ message: 'Error creating assignment' });
  }
};

const updateAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this assignment' });
    }

    if (assignment.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only edit assignments in Draft status' });
    }

    const { title, description, dueDate } = req.body;
    
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate) assignment.dueDate = dueDate;

    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    res.status(500).json({ message: 'Error updating assignment' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this assignment' });
    }

    if (assignment.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only delete assignments in Draft status' });
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    console.error('Delete assignment error:', error);
    res.status(500).json({ message: 'Error deleting assignment' });
  }
};

const publishAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to publish this assignment' });
    }

    if (assignment.status !== 'Draft') {
      return res.status(400).json({ message: 'Can only publish assignments in Draft status' });
    }

    assignment.status = 'Published';
    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Error publishing assignment:', error);
    res.status(500).json({ message: 'Error publishing assignment' });
  }
};

const completeAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to complete this assignment' });
    }

    if (assignment.status !== 'Published') {
      return res.status(400).json({ message: 'Can only complete assignments in Published status' });
    }

    assignment.status = 'Completed';
    await assignment.save();
    await assignment.populate('createdBy', 'name email');

    res.json(assignment);
  } catch (error) {
    console.error('Complete assignment error:', error);
    res.status(500).json({ message: 'Error completing assignment' });
  }
};

const getSubmissions = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view submissions for this assignment' });
    }

    const submissions = await Submission.find({ assignmentId: req.params.id })
      .populate('studentId', 'name email')
      .sort({ submittedAt: -1 });

    res.json(submissions);
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({ message: 'Error fetching submissions' });
  }
};

const markSubmissionReviewed = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const submission = await Submission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const assignment = await Assignment.findById(submission.assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (assignment.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to review this submission' });
    }

    submission.reviewed = true;
    await submission.save();
    await submission.populate('studentId', 'name email');

    res.json(submission);
  } catch (error) {
    console.error('Mark submission reviewed error:', error);
    res.status(500).json({ message: 'Error marking submission as reviewed' });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const assignments = await Assignment.find({ createdBy: req.user._id })
      .select('_id title status');

    const assignmentIds = assignments.map(a => a._id);
    
    const submissionCounts = await Submission.aggregate([
      { $match: { assignmentId: { $in: assignmentIds } } },
      { $group: { _id: '$assignmentId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    submissionCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    const analytics = assignments.map(assignment => ({
      assignmentId: assignment._id,
      title: assignment.title,
      status: assignment.status,
      submissionCount: countMap[assignment._id.toString()] || 0
    }));

    const totalAssignments = assignments.length;
    const totalSubmissions = submissionCounts.reduce((sum, item) => sum + item.count, 0);
    const publishedAssignments = assignments.filter(a => a.status === 'Published').length;

    res.json({
      assignments: analytics,
      summary: {
        totalAssignments,
        publishedAssignments,
        totalSubmissions
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
};

module.exports = {
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
};

