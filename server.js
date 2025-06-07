// Entiendo Express Server

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { handleRequest } from './src/server/http/routeHandler.js';
import { setupShutdownHandlers } from './src/server/lib/shutdown.js';


// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

import debug from 'debug';
debug.enable(process.env.DEBUG);
debug.inspectOpts.hideDate = true;

const debugServer = debug('server:express');

// Get directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Add global error handlers to prevent silent crashes
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  // Uncomment the following line if you want to keep the server running despite unhandled rejections
  // process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Uncomment the following line if you want to keep the server running despite uncaught exceptions
  // process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Add file upload middleware
app.use(fileUpload({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
  abortOnLimit: true,
  responseOnLimit: 'File too large (max 5MB)'
}));

// Serve static files from the React app build directory
const buildPath = path.join(__dirname, 'dist');
app.use(express.static(buildPath));

// API routes - delegate to route handler
app.use('/api', (req, res) => {
  handleRequest(req, res);
});

// Handle React routing, return all requests to React app
app.get('*index', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// Start the server
const server = app.listen(PORT, () => {
  debugServer(`ENTIENDO Server running on port ${PORT} ${new Date().toLocaleString()}`);
});

// Set up shutdown handlers
setupShutdownHandlers(server, __dirname);