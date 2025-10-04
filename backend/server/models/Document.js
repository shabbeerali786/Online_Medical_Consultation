import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
	{
		patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
		documentType: { 
			type: String, 
			enum: ['medical_report', 'lab_result', 'prescription', 'xray', 'scan', 'other'], 
			required: true 
		},
		fileName: { type: String, required: true, trim: true },
		fileUrl: { type: String, required: true },
		fileSize: { type: Number }, // in bytes
		mimeType: { type: String },
		description: { type: String, trim: true },
		uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Doctors who can view this
		isVerified: { type: Boolean, default: false },
		verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
		verifiedAt: { type: Date },
		tags: [{ type: String, trim: true }],
		notes: { type: String, trim: true }
	},
	{ timestamps: true }
);

// Index for faster queries
documentSchema.index({ patient: 1, createdAt: -1 });
documentSchema.index({ appointment: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
