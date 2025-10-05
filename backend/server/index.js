import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectToDatabase from './config/db.js';
import mongoose from 'mongoose';

import usersRouter from './routes/users.js';
import doctorsRouter from './routes/doctors.js';
import appointmentsRouter from './routes/appointments.js';
import documentsRouter from './routes/documents.js';
import messagesRouter from './routes/messages.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// CORS configuration
const allowedOrigins = [
	'http://localhost:5173',
	'http://localhost:3000',
	process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
	origin: function(origin, callback) {
		// Allow requests with no origin (like mobile apps or curl requests)
		if (!origin) return callback(null, true);
		
		if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
			callback(null, true);
		} else {
			callback(new Error('Not allowed by CORS'));
		}
	},
	credentials: true
}));

app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
	res.json({ status: 'ok', db: mongoose.connection.readyState });
});

app.use('/api/users', usersRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/messages', messagesRouter);

// Not found handler
app.use((req, res) => {
	res.status(404).json({ error: 'Not Found' });
});

// Error handler
app.use((err, req, res, next) => {
	console.error(err);
	res.status(500).json({ error: 'Internal Server Error' });
});

const startServer = async () => {
	try {
		await connectToDatabase();
		const port = process.env.PORT || 5000;
		app.listen(port, () => {
			console.log(`Server listening on port ${port}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error.message);
		process.exit(1);
	}
};

startServer();


