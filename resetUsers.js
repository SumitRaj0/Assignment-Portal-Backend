require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const resetUsers = async () => {
  try {
    await connectDB();

    await User.deleteMany({ email: { $in: ['teacher@example.com', 'student@example.com'] } });
    console.log('Deleted existing users');

    const teacher = await User.create({
      name: 'Teacher User',
      email: 'teacher@example.com',
      password: 'teacher123',
      role: 'teacher'
    });
    console.log('Teacher user created:', teacher.email);

    const student = await User.create({
      name: 'Student User',
      email: 'student@example.com',
      password: 'student123',
      role: 'student'
    });
    console.log('Student user created:', student.email);

    console.log('\nUsers ready for login:');
    console.log('Teacher: teacher@example.com / teacher123');
    console.log('Student: student@example.com / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

resetUsers();

