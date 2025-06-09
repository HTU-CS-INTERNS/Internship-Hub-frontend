
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
// import dataRoutes from './routes/dataRoutes'; // Example for other data

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:9002', // Adjust for your Next.js app's URL
  credentials: true,
}));
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// Basic Logging Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
// app.use('/api/data', dataRoutes); // Example: app.use('/api/internships', internshipRoutes);

// Health Check Endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Backend is healthy!', timestamp: new Date().toISOString() });
});

// Global Error Handler (basic example)
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start Server
app.listen(port, () => {
  console.log(`Backend server listening on http://localhost:${port}`);
});
