// Seeds one admin account and one student account so you can log in
// immediately after deployment. Run with: npm run seed
require('dotenv').config();
const bcrypt = require('bcryptjs');
const connectDB = require('./config/db');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const Class = require('./models/Class');

const run = async () => {
  await connectDB();

  const adminEmail = 'admin@school.test';
  const studentEmail = 'student@school.test';

  let admin = await User.findOne({ email: adminEmail });
  if (!admin) {
    const passwordHash = await bcrypt.hash('Admin123!', 10);
    admin = await User.create({ name: 'School Admin', email: adminEmail, passwordHash, role: 'admin' });
    console.log('Created admin:', adminEmail, '/ password: Admin123!');
  } else {
    console.log('Admin already exists:', adminEmail);
  }

  let demoClass = await Class.findOne({ name: 'JSS1A' });
  if (!demoClass) {
    demoClass = await Class.create({
      name: 'JSS1A',
      subjects: ['Mathematics', 'English', 'Basic Science'],
      capacity: 40,
      homeroom: 'Room 12',
    });
    console.log('Created class: JSS1A');
  }

  let studentUser = await User.findOne({ email: studentEmail });
  if (!studentUser) {
    const passwordHash = await bcrypt.hash('Student123!', 10);
    studentUser = await User.create({ name: 'Jane Doe', email: studentEmail, passwordHash, role: 'student' });

    const profile = await StudentProfile.create({
      user: studentUser._id,
      admissionNumber: 'ADM-0001',
      classId: demoClass._id,
      gender: 'female',
      status: 'active',
    });

    studentUser.studentProfile = profile._id;
    await studentUser.save();

    await Class.findByIdAndUpdate(demoClass._id, { $addToSet: { students: profile._id } });
    console.log('Created student:', studentEmail, '/ password: Student123!');
  } else {
    console.log('Student already exists:', studentEmail);
  }

  console.log('Seeding complete.');
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
