const sql = require('../services/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sendEmail = require('../services/mailer');
const multer = require('multer');
const cloudinaryStorage = require('../services/cloudinaryConfig');
const upload = multer({ storage: cloudinaryStorage });

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Check if email already exists
    const [existingUser] = await sql`
      SELECT email
      FROM users
      WHERE email = ${email}
    `;

    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Store user details in the database
    await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${hashedPassword})
    `;

    // Send a welcome email to the user
    await sendEmail(
      email,
      'Welcome to Our Platform',
      '<p>Thank you for registering. We\'re glad to have you with us.</p>'
    );

    res.json({ message: 'Registration successful' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Fetch user details from the database
    const [user] = await sql`
    SELECT id, password
    FROM users
    WHERE email = ${email}
  `;

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  // Generate a JWT token
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
} catch (error) {
  res.status(500).json({ message: 'An error occurred', error: error.message });
}
};

exports.getProfile = async (req, res) => {
  const userId = req.user.id;

  try {
    const [user] = await sql`
      SELECT name, email, profile_pic
      FROM users
      WHERE id = ${userId}
    `;

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email } = req.body;
  const imageUrl = req.file ? req.file.path : null;

  try {
    const [existingUser] = await sql`
      SELECT email
      FROM users
      WHERE email = ${email} AND id != ${userId}
    `;

    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    if (imageUrl) {
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}, profile_pic = ${imageUrl}
        WHERE id = ${userId}
      `;
    } else {
      await sql`
        UPDATE users
        SET name = ${name}, email = ${email}
        WHERE id = ${userId}
      `;
    }

    res.json({ message: 'Profile updated successfully', imageUrl });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.enrollCourse = async (req, res) => {
  const userId = parseInt(req.user.id, 10);
  const courseId = parseInt(req.body.courseId, 10);

  if (isNaN(userId) || isNaN(courseId)) {
    return res.status(400).json({ message: 'Invalid user ID or course ID' });
  }

  try {
    // Check if the user is already enrolled in the course
    const [existingEnrollment] = await sql`
      SELECT *
      FROM enrollments
      WHERE "userId" = ${userId} AND "courseId" = ${courseId}
    `;

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Add a new enrollment record in the database
    await sql`
      INSERT INTO enrollments ("userId", "courseId")
      VALUES (${userId}, ${courseId})
    `;

    res.json({ message: 'Enrollment successful' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  const userId = parseInt(req.user.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid user ID' });
  }

  try {
    // Fetch enrollment records for the authenticated user from the database
    const enrolledCourses = await sql`
      SELECT courses.*
      FROM enrollments
      JOIN courses ON enrollments."courseId" = courses.id
      WHERE enrollments."userId" = ${userId}
    `;

    res.json(enrolledCourses);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error });
  }
};