const sql = require('../services/database');

exports.getCourses = async (req, res) => {
  const { category, level, popularity, page, limit } = req.query;
  let query = 'SELECT * FROM courses';

  // Add filters to the query
  if (category || level || popularity) {
    query += ' WHERE';
    if (category) query += ` category = '${category}' AND`;
    if (level) query += ` level = '${level}' AND`;
    if (popularity) query += ` popularity = ${popularity} AND`;
    // Remove the trailing ' AND'
    query = query.slice(0, -3);
  }

  // Add pagination to the query
  if (page && limit) {
    const offset = (page - 1) * limit;
    query += ` LIMIT ${limit} OFFSET ${offset}`;
  }
  // Execute the query and send the courses as a response
  try {
    const courses = await sql(query);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.createCourse = async (req, res) => {
  const { title, description, category, level, popularity } = req.body;

  try {
    await sql`
      INSERT INTO courses (title, description, category, level, popularity)
      VALUES ('${title}', '${description}', '${category}', '${level}', ${popularity})
    `;
    res.json({ message: 'Course created successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.getCourse = async (req, res) => {
  const { id } = req.params;

  try {
    const [course] = await sql`
      SELECT * FROM courses WHERE id = ${id}
    `;
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  const { id } = req.params;
  const { title, description, category, level, popularity } = req.body;

  try {
    await sql`
      UPDATE courses
      SET title = '${title}', description = '${description}', category = '${category}', level = '${level}', popularity = ${popularity}
      WHERE id = ${id}
    `;
    res.json({ message: 'Course updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  const { id } = req.params;

  try {
    await sql`
      DELETE FROM courses WHERE id = ${id}
    `;
    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
};