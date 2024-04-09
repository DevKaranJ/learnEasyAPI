// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const { errorHandler } = require('./middleware/errorMiddleware');
const morgan = require('morgan');
const sql = require('./database');

// Logging middleware
app.use(morgan('dev'));

// Middleware
app.use(express.json());

async function startServer() {
  try {
    // Test database connection
    await sql`SELECT 1`;

    const userRoutes = require('./routes/userRoutes');
    app.use('/user', userRoutes);

    // Error handling middleware
    app.use(errorHandler);

    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database', error);
  }
}

startServer();