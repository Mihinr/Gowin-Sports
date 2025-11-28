const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { adminRequired } = require('../middleware/auth');

/**
 * Admin login endpoint
 */
router.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username, hasPassword: !!password });
    
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }
    
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        "SELECT * FROM admin_users WHERE username = ?",
        [username]
      );
      
      if (users.length === 0) {
        console.log('User not found:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const user = users[0];
      
      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      
      if (!isValidPassword) {
        console.log('Invalid password for user:', username);
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      // Create session
      const sessionToken = crypto.randomBytes(16).toString('hex');
      req.session.adminToken = sessionToken;
      req.session.adminUserId = user.id;
      
      console.log('Session created for user:', username, 'Token:', sessionToken);
      
      // Update last login
      await connection.execute(
        "UPDATE admin_users SET last_login = NOW() WHERE id = ?",
        [user.id]
      );
      
      res.json({
        message: "Login successful",
        token: sessionToken
      });
    } catch (dbError) {
      console.error('Database error:', dbError);
      throw dbError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

/**
 * Admin logout endpoint
 */
router.post('/api/admin/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: "Error logging out" });
    }
    res.json({ message: "Logout successful" });
  });
});

/**
 * Check admin authentication status
 */
router.get('/api/admin/check-auth', (req, res) => {
  try {
    // Log request for debugging
    console.log('Check-auth request received');
    console.log('Session exists:', !!req.session);
    console.log('Session adminToken:', req.session?.adminToken);
    
    // Safely check session
    let authenticated = false;
    try {
      if (req.session && typeof req.session === 'object' && req.session.adminToken) {
        authenticated = true;
      }
    } catch (sessionError) {
      console.error('Error accessing session:', sessionError);
      // Continue with authenticated = false
    }
    
    res.json({ authenticated });
  } catch (error) {
    console.error('Error in check-auth:', error);
    console.error('Error stack:', error.stack);
    console.error('Error name:', error.name);
    res.status(500).json({ 
      error: error.message || 'Internal server error',
      authenticated: false 
    });
  }
});

module.exports = router;

