import { Router } from 'express';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';

const router = Router();

// Get all doctors
router.get('/', async (req, res) => {
	try {
		const { status, specialization } = req.query;
		let query = {};
		
		// Default to only show approved doctors unless status is explicitly specified
		if (status) {
			query.verificationStatus = status;
		} else {
			query.verificationStatus = 'approved';
		}
		
		if (specialization) query.specialization = new RegExp(specialization, 'i');
		
		const doctors = await Doctor.find(query)
			.populate('user', 'name email phone isVerified')
			.populate('verifiedBy', 'name email')
			.lean();
		res.json(doctors);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Create doctor profile
router.post('/', async (req, res) => {
	try {
		const { 
			userId, 
			specialization, 
			bio, 
			licenseNumber, 
			qualification, 
			experience, 
			consultationFee 
		} = req.body;

		// Check if user exists and is a doctor
		const user = await User.findById(userId);
		if (!user || user.role !== 'doctor') {
			return res.status(400).json({ error: 'User not found or not a doctor' });
		}

		// Check if doctor profile already exists
		const existingDoctor = await Doctor.findOne({ user: userId });
		if (existingDoctor) {
			return res.status(400).json({ error: 'Doctor profile already exists' });
		}

		const doctor = await Doctor.create({
			user: userId,
			specialization,
			bio,
			licenseNumber,
			qualification,
			experience,
			consultationFee,
			verificationStatus: 'pending'
		});

		const populatedDoctor = await Doctor.findById(doctor._id)
			.populate('user', 'name email phone isVerified')
			.lean();

		res.status(201).json(populatedDoctor);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get doctor by ID
router.get('/:id', async (req, res) => {
	try {
		const doctor = await Doctor.findById(req.params.id)
			.populate('user', 'name email phone isVerified')
			.populate('verifiedBy', 'name email')
			.lean();
		
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}
		res.json(doctor);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update doctor profile
router.put('/:id', async (req, res) => {
	try {
		const { specialization, bio, experience, consultationFee, availableSlots } = req.body;
		
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}

		if (specialization) doctor.specialization = specialization;
		if (bio) doctor.bio = bio;
		if (experience !== undefined) doctor.experience = experience;
		if (consultationFee !== undefined) doctor.consultationFee = consultationFee;
		if (availableSlots) doctor.availableSlots = availableSlots;

		await doctor.save();
		const populatedDoctor = await Doctor.findById(doctor._id)
			.populate('user', 'name email phone isVerified')
			.lean();
		res.json(populatedDoctor);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Verify doctor (approve/reject)
router.patch('/:id/verify', async (req, res) => {
	try {
		const { status, verifiedBy, rejectionReason } = req.body;
		
		if (!['approved', 'rejected'].includes(status)) {
			return res.status(400).json({ error: 'Invalid verification status' });
		}

		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}

		doctor.verificationStatus = status;
		doctor.verifiedBy = verifiedBy;
		doctor.verifiedAt = new Date();
		
		if (status === 'rejected' && rejectionReason) {
			doctor.rejectionReason = rejectionReason;
		}

		await doctor.save();
		const populatedDoctor = await Doctor.findById(doctor._id)
			.populate('user', 'name email phone isVerified')
			.populate('verifiedBy', 'name email')
			.lean();
		res.json(populatedDoctor);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Upload verification documents
router.post('/:id/documents', async (req, res) => {
	try {
		const { documentType, documentUrl } = req.body;
		
		const doctor = await Doctor.findById(req.params.id);
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor not found' });
		}

		doctor.verificationDocuments.push({
			documentType,
			documentUrl,
			uploadedAt: new Date()
		});

		await doctor.save();
		res.json({ message: 'Document uploaded successfully' });
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get pending verifications
router.get('/verification/pending', async (req, res) => {
	try {
		const doctors = await Doctor.find({ verificationStatus: 'pending' })
			.populate('user', 'name email phone isVerified')
			.lean();
		res.json(doctors);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get doctor by user ID
router.get('/user/:userId', async (req, res) => {
	try {
		const doctor = await Doctor.findOne({ user: req.params.userId })
			.populate('user', 'name email phone isVerified')
			.lean();
		
		if (!doctor) {
			return res.status(404).json({ error: 'Doctor profile not found' });
		}
		res.json(doctor);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Approve all pending doctors (for development/testing)
router.post('/approve-all', async (req, res) => {
	try {
		const result = await Doctor.updateMany(
			{ verificationStatus: 'pending' },
			{ verificationStatus: 'approved', verifiedAt: new Date() }
		);
		res.json({ 
			message: 'All pending doctors approved', 
			modifiedCount: result.modifiedCount 
		});
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
