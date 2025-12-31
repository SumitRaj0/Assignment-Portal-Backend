require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/database');

const verifyUser = async () => {
  try {
    await connectDB();

    const teacherEmail = 'teacher@example.com';
    const teacher = await User.findOne({ email: teacherEmail });

    if (teacher) {
      console.log('✅ Teacher user found:');
      console.log('   ID:', teacher._id);
      console.log('   Email:', teacher.email);
      console.log('   Name:', teacher.name);
      console.log('   Role:', teacher.role);
      console.log('   Role type:', typeof teacher.role);
    } else {
      console.log('❌ Teacher user not found!');
    }

    const studentEmail = 'student@example.com';
    const student = await User.findOne({ email: studentEmail });

    if (student) {
      console.log('\n✅ Student user found:');
      console.log('   ID:', student._id);
      console.log('   Email:', student.email);
      console.log('   Name:', student.name);
      console.log('   Role:', student.role);
      console.log('   Role type:', typeof student.role);
    } else {
      console.log('\n❌ Student user not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error verifying users:', error);
    process.exit(1);
  }
};

verifyUser();

