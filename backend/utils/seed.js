const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Always load .env from backend root, no matter where this script is called from
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const seed = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('ERROR: MONGO_URI not found. Make sure backend/.env exists with MONGO_URI=mongodb://localhost:27017/eduerp');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected for seeding...');

  await Promise.all([User.deleteMany(), Student.deleteMany(), Teacher.deleteMany()]);
  console.log('Cleared existing data');

  await User.create({ name: 'Admin User', email: 'admin@eduerp.com', password: 'admin123', role: 'admin' });
  console.log('Admin created: admin@eduerp.com / admin123');

  const teacherUser = await User.create({ name: 'John Smith', email: 'teacher@eduerp.com', password: 'teacher123', role: 'teacher', phone: '9876543210' });
  await Teacher.create({ user: teacherUser._id, employeeId: 'TCH001', department: 'Science', subjects: ['Physics', 'Chemistry', 'Math'], classes: ['10A', '11B', '12C'], qualification: 'M.Sc Physics', experience: 8 });
  console.log('Teacher created: teacher@eduerp.com / teacher123');

  const studentUser = await User.create({ name: 'Jane Doe', email: 'student@eduerp.com', password: 'student123', role: 'student', phone: '9123456789' });
  await Student.create({ user: studentUser._id, rollNumber: 'STU001', class: '10', section: 'A', parentName: 'Robert Doe', parentPhone: '9999999999', gender: 'female', bloodGroup: 'B+' });
  console.log('Student created: student@eduerp.com / student123');

  console.log('\nSeeding complete! Run: npm run dev');
  process.exit(0);
};

seed().catch((err) => { console.error('Seed error:', err.message); process.exit(1); });
