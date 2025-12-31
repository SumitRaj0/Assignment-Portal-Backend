require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const connectDB = require('./config/database');

const createUsers = async () => {
  try {
    await connectDB();

    const teacher = await User.findOne({ email: 'teacher@example.com' });
    if (!teacher) {
      await User.create({
        name: 'Teacher User',
        email: 'teacher@example.com',
        password: 'teacher123',
        role: 'teacher'
      });
      console.log('Teacher user created');
    } else {
      console.log('Teacher user already exists');
    }

    const student = await User.findOne({ email: 'student@example.com' });
    if (!student) {
      await User.create({
        name: 'Student User',
        email: 'student@example.com',
        password: 'student123',
        role: 'student'
      });
      console.log('Student user created');
    } else {
      console.log('Student user already exists');
    }

    console.log('Done!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createUsers();

