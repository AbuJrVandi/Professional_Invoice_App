const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const register = (req, res) => {
  const { fullName, email, username, phoneNumber, address, password } = req.body;

  // Validate required fields
  if (!fullName || !email || !username || !password) {
    return res.status(400).json({ error: 'All required fields must be provided' });
  }

  // Validate password strength
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      error: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    });
  }

  // Check if user already exists
  db.get('SELECT id FROM users WHERE email = ? OR username = ?', [email, username], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (user) {
      return res.status(400).json({ error: 'Email or username already exists' });
    }

    try {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Insert new user
      const sql = `
        INSERT INTO users (fullName, email, username, phoneNumber, address, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

      db.run(sql, [fullName, email, username, phoneNumber, address, hashedPassword], function(err) {
        if (err) {
          console.error('Error creating user:', err);
          return res.status(500).json({ error: 'Error creating user' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: this.lastID }, jwtSecret, { expiresIn: '24h' });

        res.status(201).json({
          message: 'User registered successfully',
          token,
          user: {
            id: this.lastID,
            fullName,
            email,
            username
          }
        });
      });
    } catch (error) {
      console.error('Error hashing password:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.get(sql, [email], async (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    try {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ id: user.id }, jwtSecret, { expiresIn: '24h' });

      res.json({
        token,
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          username: user.username
        }
      });
    } catch (error) {
      console.error('Error comparing passwords:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};

const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const { name, email, currentPassword, newPassword, avatar, avatarColor } = req.body;

  try {
    // Get current user data
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set new password' });
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      // Validate new password
      if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({
          error: 'New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character'
        });
      }
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const emailExists = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });

      if (emailExists) {
        return res.status(400).json({ error: 'Email is already taken' });
      }
    }

    // Prepare update fields
    const updates = [];
    const values = [];

    if (name) {
      updates.push('fullName = ?');
      values.push(name);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }
    if (avatarColor) {
      updates.push('avatarColor = ?');
      values.push(avatarColor);
    }
    if (newPassword) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      updates.push('password = ?');
      values.push(hashedPassword);
    }

    // Add userId to values array for WHERE clause
    values.push(userId);

    // Update user profile
    const updateQuery = `
      UPDATE users 
      SET ${updates.join(', ')}, updatedAt = CURRENT_TIMESTAMP 
      WHERE id = ?
    `;

    await new Promise((resolve, reject) => {
      db.run(updateQuery, values, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });

    // Get updated user data
    const updatedUser = await new Promise((resolve, reject) => {
      db.get('SELECT id, fullName, email, avatar, avatarColor FROM users WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  updateProfile
}; 