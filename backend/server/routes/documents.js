import { Router } from 'express';
import Document from '../models/Document.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		const uploadDir = path.join(__dirname, '../../uploads/documents');
		// Create directory if it doesn't exist
		if (!fs.existsSync(uploadDir)) {
			fs.mkdirSync(uploadDir, { recursive: true });
		}
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
		cb(null, uniqueSuffix + '-' + file.originalname);
	}
});

const upload = multer({
	storage: storage,
	limits: {
		fileSize: 10 * 1024 * 1024 // 10MB limit
	},
	fileFilter: (req, file, cb) => {
		const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
		const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
		const mimetype = allowedTypes.test(file.mimetype);
		
		if (mimetype && extname) {
			return cb(null, true);
		} else {
			cb(new Error('Only images, PDFs, and Word documents are allowed'));
		}
	}
});

// Get all documents with filters
router.get('/', async (req, res) => {
	try {
		const { patientId, appointmentId, documentType } = req.query;
		let query = {};
		
		if (patientId) query.patient = patientId;
		if (appointmentId) query.appointment = appointmentId;
		if (documentType) query.documentType = documentType;
		
		const documents = await Document.find(query)
			.populate('patient', 'name email')
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.populate('sharedWith', 'name email')
			.populate('verifiedBy', 'name email')
			.sort({ createdAt: -1 })
			.lean();
		
		res.json(documents);
	} catch (err) {
		console.error('Error fetching documents:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Upload a new document
router.post('/upload', upload.single('file'), async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}
		
		const { patientId, appointmentId, documentType, description, sharedWith, tags, notes } = req.body;
		
		if (!patientId || !documentType) {
			return res.status(400).json({ error: 'Patient ID and document type are required' });
		}
		
		// Create file URL (relative path for serving)
		const fileUrl = `/uploads/documents/${req.file.filename}`;
		
		const documentData = {
			patient: patientId,
			appointment: appointmentId || null,
			documentType,
			fileName: req.file.originalname,
			fileUrl,
			fileSize: req.file.size,
			mimeType: req.file.mimetype,
			description: description || '',
			uploadedBy: patientId, // In production, use authenticated user ID
			sharedWith: sharedWith ? JSON.parse(sharedWith) : [],
			tags: tags ? JSON.parse(tags) : [],
			notes: notes || ''
		};
		
		const document = await Document.create(documentData);
		
		const populatedDocument = await Document.findById(document._id)
			.populate('patient', 'name email')
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.populate('sharedWith', 'name email')
			.lean();
		
		res.status(201).json(populatedDocument);
	} catch (err) {
		console.error('Error uploading document:', err);
		// Delete uploaded file if database save fails
		if (req.file) {
			fs.unlinkSync(req.file.path);
		}
		res.status(400).json({ error: err.message });
	}
});

// Get document by ID
router.get('/:id', async (req, res) => {
	try {
		const document = await Document.findById(req.params.id)
			.populate('patient', 'name email')
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.populate('sharedWith', 'name email')
			.populate('verifiedBy', 'name email')
			.lean();
		
		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}
		
		res.json(document);
	} catch (err) {
		console.error('Error fetching document:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Update document metadata
router.put('/:id', async (req, res) => {
	try {
		const { description, sharedWith, tags, notes } = req.body;
		
		const document = await Document.findById(req.params.id);
		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}
		
		if (description !== undefined) document.description = description;
		if (sharedWith !== undefined) document.sharedWith = sharedWith;
		if (tags !== undefined) document.tags = tags;
		if (notes !== undefined) document.notes = notes;
		
		await document.save();
		
		const populatedDocument = await Document.findById(document._id)
			.populate('patient', 'name email')
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.populate('sharedWith', 'name email')
			.lean();
		
		res.json(populatedDocument);
	} catch (err) {
		console.error('Error updating document:', err);
		res.status(400).json({ error: err.message });
	}
});

// Share document with doctors
router.patch('/:id/share', async (req, res) => {
	try {
		const { doctorIds } = req.body;
		
		if (!Array.isArray(doctorIds)) {
			return res.status(400).json({ error: 'doctorIds must be an array' });
		}
		
		const document = await Document.findById(req.params.id);
		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}
		
		// Add new doctors to sharedWith array (avoid duplicates)
		doctorIds.forEach(doctorId => {
			if (!document.sharedWith.includes(doctorId)) {
				document.sharedWith.push(doctorId);
			}
		});
		
		await document.save();
		
		const populatedDocument = await Document.findById(document._id)
			.populate('patient', 'name email')
			.populate('sharedWith', 'name email')
			.lean();
		
		res.json(populatedDocument);
	} catch (err) {
		console.error('Error sharing document:', err);
		res.status(400).json({ error: err.message });
	}
});

// Verify document (for doctors/admins)
router.patch('/:id/verify', async (req, res) => {
	try {
		const { verifiedBy } = req.body;
		
		const document = await Document.findById(req.params.id);
		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}
		
		document.isVerified = true;
		document.verifiedBy = verifiedBy;
		document.verifiedAt = new Date();
		
		await document.save();
		
		const populatedDocument = await Document.findById(document._id)
			.populate('patient', 'name email')
			.populate('verifiedBy', 'name email')
			.lean();
		
		res.json(populatedDocument);
	} catch (err) {
		console.error('Error verifying document:', err);
		res.status(400).json({ error: err.message });
	}
});

// Delete document
router.delete('/:id', async (req, res) => {
	try {
		const document = await Document.findById(req.params.id);
		if (!document) {
			return res.status(404).json({ error: 'Document not found' });
		}
		
		// Delete file from filesystem
		const filePath = path.join(__dirname, '../../', document.fileUrl);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
		}
		
		await Document.findByIdAndDelete(req.params.id);
		
		res.json({ message: 'Document deleted successfully' });
	} catch (err) {
		console.error('Error deleting document:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get documents by patient
router.get('/patient/:patientId', async (req, res) => {
	try {
		const documents = await Document.find({ patient: req.params.patientId })
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.populate('sharedWith', 'name email')
			.sort({ createdAt: -1 })
			.lean();
		
		res.json(documents);
	} catch (err) {
		console.error('Error fetching patient documents:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

// Get documents shared with a doctor
router.get('/doctor/:doctorId/shared', async (req, res) => {
	try {
		const documents = await Document.find({ sharedWith: req.params.doctorId })
			.populate('patient', 'name email')
			.populate('appointment')
			.populate('uploadedBy', 'name email')
			.sort({ createdAt: -1 })
			.lean();
		
		res.json(documents);
	} catch (err) {
		console.error('Error fetching shared documents:', err);
		res.status(500).json({ error: 'Internal server error' });
	}
});

export default router;
