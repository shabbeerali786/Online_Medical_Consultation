import { Router } from 'express';
import Message from '../models/Message.js';

const router = Router();

// Get all messages with filters
router.get('/', async (req, res) => {
	try {
		const { appointmentId, senderId, receiverId } = req.query;
		let query = {};
		
		if (appointmentId) query.appointment = appointmentId;
		if (senderId) query.sender = senderId;
		if (receiverId) query.receiver = receiverId;
		
		const messages = await Message.find(query)
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.populate('appointment')
			.populate('attachments.documentId')
			.sort({ createdAt: 1 })
			.lean();
		
		res.json(messages);
	} catch (err) {
		console.error('Error fetching messages:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Send a new message
router.post('/', async (req, res) => {
	try {
		const { appointmentId, senderId, receiverId, content, messageType, attachments } = req.body;
		
		if (!appointmentId || !senderId || !receiverId || !content) {
			return res.status(400).json({ error: 'Appointment ID, sender ID, receiver ID, and content are required' });
		}
		
		const messageData = {
			appointment: appointmentId,
			sender: senderId,
			receiver: receiverId,
			content,
			messageType: messageType || 'text',
			attachments: attachments || []
		};
		
		const message = await Message.create(messageData);
		
		const populatedMessage = await Message.findById(message._id)
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.populate('appointment')
			.populate('attachments.documentId')
			.lean();
		
		res.status(201).json(populatedMessage);
	} catch (err) {
		console.error('Error sending message:', err);
		res.status(400).json({ error: err.message });
	}
});

// Get messages for a specific appointment
router.get('/appointment/:appointmentId', async (req, res) => {
	try {
		const messages = await Message.find({ 
			appointment: req.params.appointmentId,
			isDeleted: false
		})
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.populate('attachments.documentId')
			.sort({ createdAt: 1 })
			.lean();
		
		res.json(messages);
	} catch (err) {
		console.error('Error fetching appointment messages:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get conversation between two users for an appointment
router.get('/conversation', async (req, res) => {
	try {
		const { appointmentId, userId1, userId2 } = req.query;
		
		if (!appointmentId || !userId1 || !userId2) {
			return res.status(400).json({ error: 'Appointment ID and both user IDs are required' });
		}
		
		const messages = await Message.find({
			appointment: appointmentId,
			isDeleted: false,
			$or: [
				{ sender: userId1, receiver: userId2 },
				{ sender: userId2, receiver: userId1 }
			]
		})
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.populate('attachments.documentId')
			.sort({ createdAt: 1 })
			.lean();
		
		res.json(messages);
	} catch (err) {
		console.error('Error fetching conversation:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Mark message as read
router.patch('/:id/read', async (req, res) => {
	try {
		const message = await Message.findById(req.params.id);
		if (!message) {
			return res.status(404).json({ error: 'Message not found' });
		}
		
		message.isRead = true;
		message.readAt = new Date();
		await message.save();
		
		const populatedMessage = await Message.findById(message._id)
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.lean();
		
		res.json(populatedMessage);
	} catch (err) {
		console.error('Error marking message as read:', err);
		res.status(400).json({ error: err.message });
	}
});

// Mark multiple messages as read
router.patch('/bulk/read', async (req, res) => {
	try {
		const { messageIds } = req.body;
		
		if (!Array.isArray(messageIds)) {
			return res.status(400).json({ error: 'messageIds must be an array' });
		}
		
		await Message.updateMany(
			{ _id: { $in: messageIds } },
			{ $set: { isRead: true, readAt: new Date() } }
		);
		
		res.json({ message: 'Messages marked as read', count: messageIds.length });
	} catch (err) {
		console.error('Error marking messages as read:', err);
		res.status(400).json({ error: err.message });
	}
});

// Get unread message count for a user
router.get('/unread/count', async (req, res) => {
	try {
		const { userId } = req.query;
		
		if (!userId) {
			return res.status(400).json({ error: 'User ID is required' });
		}
		
		const count = await Message.countDocuments({
			receiver: userId,
			isRead: false,
			isDeleted: false
		});
		
		res.json({ count });
	} catch (err) {
		console.error('Error counting unread messages:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Delete message (soft delete)
router.delete('/:id', async (req, res) => {
	try {
		const { userId } = req.body;
		
		const message = await Message.findById(req.params.id);
		if (!message) {
			return res.status(404).json({ error: 'Message not found' });
		}
		
		// Add user to deletedBy array
		if (!message.deletedBy.includes(userId)) {
			message.deletedBy.push(userId);
		}
		
		// If both sender and receiver have deleted, mark as deleted
		if (message.deletedBy.length >= 2) {
			message.isDeleted = true;
		}
		
		await message.save();
		
		res.json({ message: 'Message deleted successfully' });
	} catch (err) {
		console.error('Error deleting message:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get recent conversations for a user
router.get('/conversations/:userId', async (req, res) => {
	try {
		const userId = req.params.userId;
		
		// Get all appointments where user is involved
		const messages = await Message.find({
			$or: [{ sender: userId }, { receiver: userId }],
			isDeleted: false
		})
			.populate('sender', 'name email role')
			.populate('receiver', 'name email role')
			.populate('appointment')
			.sort({ createdAt: -1 })
			.lean();
		
		// Group by appointment and get latest message for each
		const conversationMap = new Map();
		messages.forEach(msg => {
			const appointmentId = msg.appointment._id.toString();
			if (!conversationMap.has(appointmentId)) {
				conversationMap.set(appointmentId, {
					appointment: msg.appointment,
					lastMessage: msg,
					unreadCount: 0
				});
			}
			// Count unread messages
			if (msg.receiver._id.toString() === userId && !msg.isRead) {
				conversationMap.get(appointmentId).unreadCount++;
			}
		});
		
		const conversations = Array.from(conversationMap.values());
		
		res.json(conversations);
	} catch (err) {
		console.error('Error fetching conversations:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
