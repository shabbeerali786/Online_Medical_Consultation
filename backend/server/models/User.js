import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, unique: true, lowercase: true, trim: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['patient', 'doctor', 'admin'], default: 'patient', required: true },
		isVerified: { type: Boolean, default: false },
		phone: { type: String, trim: true },
		address: { type: String, trim: true },
		dateOfBirth: { type: Date },
		gender: { type: String, enum: ['male', 'female', 'other'] },
		isActive: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
