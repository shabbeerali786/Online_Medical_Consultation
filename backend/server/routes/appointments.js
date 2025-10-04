import { Router } from 'express';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';

const router = Router();

// Get all appointments with filters
router.get('/', async (req, res) => {
	try {
		const { patientId, doctorId, status, date } = req.query;
		let query = {};
		
		if (patientId) query.patient = patientId;
		if (doctorId) query.doctor = doctorId;
		if (status) query.status = status;
		if (date) {
			const startDate = new Date(date);
			const endDate = new Date(date);
			endDate.setDate(endDate.getDate() + 1);
			query.dateTime = { $gte: startDate, $lt: endDate };
		}
		
		const appointments = await Appointment.find(query)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.populate('cancelledBy', 'name email')
			.populate('rescheduledBy', 'name email')
			.sort({ dateTime: 1 })
			.lean();
		res.json(appointments);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Create new appointment
router.post('/', async (req, res) => {
	try {
		const { patient, doctor, dateTime, reason, duration } = req.body;
		
		// Check if doctor is available
		const doctorDoc = await Doctor.findById(doctor);
		if (!doctorDoc || !doctorDoc.available) {
			return res.status(400).json({ error: 'Doctor is not available' });
		}
		
		// Check for conflicting appointments
		const conflictingAppointment = await Appointment.findOne({
			doctor,
			dateTime: { $gte: new Date(dateTime), $lt: new Date(new Date(dateTime).getTime() + (duration || 30) * 60000) },
			status: { $in: ['scheduled', 'confirmed'] }
		});
		
		if (conflictingAppointment) {
			return res.status(400).json({ error: 'Time slot is already booked' });
		}
		
		const appointment = await Appointment.create({
			patient,
			doctor,
			dateTime,
			reason,
			duration: duration || 30
		});
		
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.lean();
		
		res.status(201).json(populatedAppointment);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get appointment by ID
router.get('/:id', async (req, res) => {
	try {
		const appointment = await Appointment.findById(req.params.id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.populate('cancelledBy', 'name email')
			.populate('rescheduledBy', 'name email')
			.lean();
		
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		res.json(appointment);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update appointment
router.put('/:id', async (req, res) => {
	try {
		const { reason, notes, prescription } = req.body;
		
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		if (reason) appointment.reason = reason;
		if (notes) appointment.notes = notes;
		if (prescription) appointment.prescription = prescription;
		
		await appointment.save();
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.lean();
		res.json(populatedAppointment);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Cancel appointment
router.patch('/:id/cancel', async (req, res) => {
	try {
		const { cancelledBy, cancellationReason } = req.body;
		
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		if (appointment.status === 'cancelled') {
			return res.status(400).json({ error: 'Appointment is already cancelled' });
		}
		
		appointment.status = 'cancelled';
		appointment.cancelledBy = cancelledBy;
		appointment.cancelledAt = new Date();
		appointment.cancellationReason = cancellationReason;
		
		await appointment.save();
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.populate('cancelledBy', 'name email')
			.lean();
		res.json(populatedAppointment);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Reschedule appointment
router.patch('/:id/reschedule', async (req, res) => {
	try {
		const { newDateTime, rescheduledBy, rescheduleReason } = req.body;
		
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		if (appointment.status === 'cancelled') {
			return res.status(400).json({ error: 'Cannot reschedule a cancelled appointment' });
		}
		
		// Check for conflicting appointments at new time
		const conflictingAppointment = await Appointment.findOne({
			doctor: appointment.doctor,
			dateTime: { $gte: new Date(newDateTime), $lt: new Date(new Date(newDateTime).getTime() + appointment.duration * 60000) },
			status: { $in: ['scheduled', 'confirmed'] },
			_id: { $ne: appointment._id }
		});
		
		if (conflictingAppointment) {
			return res.status(400).json({ error: 'New time slot is already booked' });
		}
		
		appointment.originalDateTime = appointment.dateTime;
		appointment.dateTime = newDateTime;
		appointment.status = 'rescheduled';
		appointment.rescheduledBy = rescheduledBy;
		appointment.rescheduledAt = new Date();
		appointment.rescheduleReason = rescheduleReason;
		
		await appointment.save();
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.populate('rescheduledBy', 'name email')
			.lean();
		res.json(populatedAppointment);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Update appointment status
router.patch('/:id/status', async (req, res) => {
	try {
		const { status } = req.body;
		
		const validStatuses = ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled'];
		if (!validStatuses.includes(status)) {
			return res.status(400).json({ error: 'Invalid status' });
		}
		
		const appointment = await Appointment.findById(req.params.id);
		if (!appointment) {
			return res.status(404).json({ error: 'Appointment not found' });
		}
		
		appointment.status = status;
		await appointment.save();
		
		const populatedAppointment = await Appointment.findById(appointment._id)
			.populate('patient', 'name email phone')
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.lean();
		res.json(populatedAppointment);
	} catch (err) {
		res.status(400).json({ error: err.message });
	}
});

// Get appointments by patient
router.get('/patient/:patientId', async (req, res) => {
	try {
		const appointments = await Appointment.find({ patient: req.params.patientId })
			.populate({ path: 'doctor', populate: { path: 'user', select: 'name email phone' } })
			.sort({ dateTime: -1 })
			.lean();
		res.json(appointments);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get appointments by doctor
router.get('/doctor/:doctorId', async (req, res) => {
	try {
		const appointments = await Appointment.find({ doctor: req.params.doctorId })
			.populate('patient', 'name email phone')
			.sort({ dateTime: -1 })
			.lean();
		res.json(appointments);
	} catch (err) {
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
