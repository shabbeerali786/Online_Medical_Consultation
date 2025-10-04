import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema(
	{
		user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
		specialization: { type: String, required: true, trim: true },
		bio: { type: String, default: '' },
		available: { type: Boolean, default: true },
		licenseNumber: { type: String, required: true, trim: true, unique: true },
		qualification: { type: String, required: true, trim: true },
		experience: { type: Number, default: 0 },
		verificationStatus: { 
			type: String, 
			enum: ['pending', 'approved', 'rejected'], 
			default: 'pending' 
		},
		verificationDocuments: [{
			documentType: { type: String, enum: ['license', 'degree', 'certificate'] },
			documentUrl: { type: String },
			uploadedAt: { type: Date, default: Date.now }
		}],
		verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		verifiedAt: { type: Date },
		rejectionReason: { type: String, trim: true },
		consultationFee: { type: Number, default: 0 },
		availableSlots: [{
			dayOfWeek: { type: Number, min: 0, max: 6 }, // 0 = Sunday, 1 = Monday, etc.
			startTime: { type: String }, // Format: "09:00"
			endTime: { type: String }, // Format: "17:00"
			isActive: { type: Boolean, default: true }
		}]
	},
	{ timestamps: true }
);

const Doctor = mongoose.model('Doctor', doctorSchema);
export default Doctor;
