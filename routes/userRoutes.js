const express = require('express');
const multer = require('multer');
const userController = require('../controllers/userController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { storage: cloudinaryStorage } = require('../services/cloudinaryConfig');
const upload = multer({ storage: cloudinaryStorage });

const router = express.Router();

// Routes for user registration, login, profile, and course enrollment
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, upload.single('image'), userController.updateProfile);
router.post('/enroll', authenticateToken, userController.enrollCourse);
router.get('/enrolled-courses', authenticateToken, userController.getEnrolledCourses);

module.exports = router;