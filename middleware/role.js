const teacherOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role === 'teacher') {
    next();
  } else {
    res.status(403).json({ message: 'Teacher access required' });
  }
};

const studentOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  if (req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Student access required' });
  }
};

module.exports = { teacherOnly, studentOnly };

