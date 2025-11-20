import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
	{
		patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
		dateTime: { type: Date, required: true },
		reason: { type: String, trim: true },
		status: { 
			type: String, 
			enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'cancelled-no-show'], 
			default: 'scheduled' 
		},
		duration: { type: Number, default: 30 }, // in minutes
		confirmedAt: { type: Date },
		checkedInAt: { type: Date },
		notes: { type: String, trim: true },
		prescription: {
			notes: { type: String, trim: true },
			medications: { type: String, trim: true },
			followUpDate: { type: String, trim: true }
		},
		cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		cancelledAt: { type: Date },
		cancellationReason: { type: String, trim: true },
		originalDateTime: { type: Date }, // For rescheduled appointments
		rescheduledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		rescheduledAt: { type: Date },
		rescheduleReason: { type: String, trim: true }
	},
	{ timestamps: true }
);

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
