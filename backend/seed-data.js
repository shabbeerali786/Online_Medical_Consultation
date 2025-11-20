import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './server/models/User.js';
import Doctor from './server/models/Doctor.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log('Connected to MongoDB for seeding');

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    const users = await User.create([
      {
        name: 'Admin User',
        email: 'admin@admin.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      },
      {
        name: 'John Patient',
        email: 'patient@demo.com',
        password: hashedPassword,
        role: 'patient'
      },
      {
        name: 'Dr. Aravind Raj',
        email: 'aravind@demo.com',
        password: hashedPassword,
        role: 'doctor'
      },
      {
        name: 'Dr. Priya Lakshmi',
        email: 'priya@demo.com',
        password: hashedPassword,
        role: 'doctor'
      },
      {
        name: 'Dr. Karthik Subramanian',
        email: 'karthik@demo.com',
        password: hashedPassword,
        role: 'doctor'
      }
    ]);

    console.log('Users created:', users.length);

    // Create doctors
    const doctors = await Doctor.create([
      {
        user: users[2]._id, // Dr. Aravind Raj
        specialization: 'Cardiology',
        bio: 'Experienced cardiologist with 15 years of practice',
        available: true,
        licenseNumber: 'CARD123456',
        qualification: 'MD in Cardiology',
        experience: 15,
        verificationStatus: 'approved'
      },
      {
        user: users[3]._id, // Dr. Priya Lakshmi
        specialization: 'Dermatology',
        bio: 'Specialist in skin conditions and treatments',
        available: true,
        licenseNumber: 'DERM789012',
        qualification: 'MD in Dermatology',
        experience: 12,
        verificationStatus: 'approved'
      },
      {
        user: users[4]._id, // Dr. Karthik Subramanian
        specialization: 'Neurology',
        bio: 'Expert in neurological disorders',
        available: true,
        licenseNumber: 'NEURO345678',
        qualification: 'MD in Neurology',
        experience: 18,
        verificationStatus: 'approved'
      }
    ]);

    console.log('Doctors created:', doctors.length);
    console.log('Database seeded successfully!');
    
    // Print the created data for reference
    console.log('\nCreated Users:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.role}): ${user._id}`);
    });

    console.log('\nCreated Doctors:');
    doctors.forEach(doctor => {
      const user = users.find(u => u._id.equals(doctor.user));
      console.log(`- ${user.name} (${doctor.specialization}): ${doctor._id}`);
    });

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

seedDatabase();
