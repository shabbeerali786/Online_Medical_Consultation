import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import User from './server/models/User.js';
import Doctor from './server/models/Doctor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const backupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB_NAME,
    });
    console.log('Connected to MongoDB for backup');

    // Fetch all data
    const users = await User.find().lean();
    const doctors = await Doctor.find().lean();

    // Create backup object
    const backup = {
      timestamp: new Date().toISOString(),
      users,
      doctors
    };

    // Create backups directory if it doesn't exist
    const backupsDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir);
    }

    // Save backup to file
    const filename = `backup-${Date.now()}.json`;
    const filepath = path.join(backupsDir, filename);
    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`\n✅ Backup created successfully!`);
    console.log(`📁 File: ${filepath}`);
    console.log(`\n📊 Backup Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Doctors: ${doctors.length}`);
    
    // Print user details
    if (users.length > 0) {
      console.log(`\n👥 Users in backup:`);
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.role}) - ${user.email}`);
      });
    }

  } catch (error) {
    console.error('❌ Error backing up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
};

backupDatabase();
