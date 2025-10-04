import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
	{
		appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', required: true },
		sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
		messageType: { 
			type: String, 
			enum: ['text', 'document', 'system'], 
			default: 'text' 
		},
		content: { type: String, required: true, trim: true },
		attachments: [{
			documentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Document' },
			fileName: { type: String },
			fileUrl: { type: String }
		}],
		isRead: { type: Boolean, default: false },
		readAt: { type: Date },
		isDeleted: { type: Boolean, default: false },
		deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
	},
	{ timestamps: true }
);

// Indexes for faster queries
messageSchema.index({ appointment: 1, createdAt: 1 });
messageSchema.index({ sender: 1, receiver: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });

const Message = mongoose.model('Message', messageSchema);
export default Message;
