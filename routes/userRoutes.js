const express = require('express');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes for user registration, login, profile, and course enrollment
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, userController.updateProfile);
router.post('/enroll', authenticateToken, userController.enrollCourse);
router.get('/enrolled-courses', authenticateToken, userController.getEnrolledCourses);

module.exports = router;
