import { Router } from 'express';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import bcrypt from 'bcryptjs';

const router = Router();

// Get all users (for admin purposes)
router.get('/', async (req, res) => {
	const users = await User.find().lean();
	res.json(users);
});

// Create new user (signup)
router.post('/', async (req, res) => {
	try {
		const { name, email, password, role, specialization, qualification, licenseNumber } = req.body;
		
		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ error: 'User already exists with this email' });
		}

		// Validate doctor-specific fields
		if (role === 'doctor') {
			if (!specialization || !qualification || !licenseNumber) {
				return res.status(400).json({ error: 'Specialization, qualification, and license number are required for doctors' });
			}
		}

		// Hash password
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create user
		const user = await User.create({
			name,
			email,
			password: hashedPassword,
			role: role || 'patient'
		});

		// If user is a doctor, create doctor profile
		if (role === 'doctor') {
			await Doctor.create({
				user: user._id,
				specialization,
				qualification,
				licenseNumber,
				bio: `Dr. ${name} - ${specialization} specialist`,
				available: true,
				verificationStatus: 'approved', // Auto-approve for now (change to 'pending' for production)
				experience: 0
			});
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user.toObject();
		res.status(201).json(userWithoutPassword);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Login endpoint
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user by email
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		// Check password
		const isPasswordValid = await bcrypt.compare(password, user.password);
		if (!isPasswordValid) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		// Return user without password
		const { password: _, ...userWithoutPassword } = user.toObject();
		res.json(userWithoutPassword);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get user by ID
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-password');
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}
		res.json(user);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update user
router.put('/:id', async (req, res) => {
	try {
		const { name, email, phone, address, dateOfBirth, gender } = req.body;
		
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		// Update fields
		if (name) user.name = name;
		if (email) user.email = email;
		if (phone) user.phone = phone;
		if (address) user.address = address;
		if (dateOfBirth) user.dateOfBirth = dateOfBirth;
		if (gender) user.gender = gender;

		await user.save();
		const { password: _, ...userWithoutPassword } = user.toObject();
		res.json(userWithoutPassword);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Delete user (soft delete)
router.delete('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		user.isActive = false;
		await user.save();
		res.json({ message: 'User deactivated successfully' });
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Verify user
router.patch('/:id/verify', async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({ error: 'User not found' });
		}

		user.isVerified = true;
		await user.save();
		res.json({ message: 'User verified successfully' });
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get users by role
router.get('/role/:role', async (req, res) => {
	try {
		const { role } = req.params;
		const users = await User.find({ role, isActive: true }).select('-password');
		res.json(users);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
