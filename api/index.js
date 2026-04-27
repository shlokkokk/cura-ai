const server = require('../server.js');

module.exports = (req, res) => {
  // Vercel serverless function wrapper for the HTTP server
  server.emit('request', req, res);
};
