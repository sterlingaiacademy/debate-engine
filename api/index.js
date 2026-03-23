// Vercel Serverless Function entrypoint
// Re-exports the Express app from the backend directory
const app = require('../backend/server.js');

module.exports = app;
