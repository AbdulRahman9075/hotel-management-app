const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with better error handling
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('[FAIL] Database connection failed:', err.message);
    console.error('[FAIL] Please check your database configuration in server/.env file');
    console.error('[FAIL] Make sure MySQL is running and the database exists');
    console.error('[INFO] Server will continue without database connection...');
  } else {
    console.log('Connected to MySQL database');
    console.log(`Database: ${process.env.DB_NAME || 'hotel_management'}`);
  }
});

// Handle database connection errors
db.on('error', (err) => {
  console.error('Database connection lost:', err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    console.log('Attempting to reconnect...');
  } else {
    throw err;
  }
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// User Authentication Routes
app.post('/api/register', async (req, res) => {
  try {
    const {cnic,email, password, role = 'customer', firstName, lastName, phone } = req.body;
    
    // Check if user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ? OR cnic = ?';
    db.query(checkUserQuery, [email, cnic], async (err, results) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (results.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insert new user
      const insertUserQuery = `
        INSERT INTO users (cnic, email, password, role, first_name, last_name, phone, created_at) 
        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
      `;
      
      db.query(insertUserQuery, [cnic, email, hashedPassword, role, firstName, lastName, phone], (err, result) => {
        if (err) {
          return res.status(500).json({ message: 'Failed to create user' });
        }
        
        res.status(201).json({ message: 'User created successfully', userId: result.insertId });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt for email:', email);
    
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
      if (err) {
        console.error('Database query error:', err);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }
      
      console.log('Database query results:', results.length > 0 ? 'User found' : 'No user found');
      
      if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      const user = results[0];
      console.log('Found user:', { id: user.id, email: user.email, role: user.role });
      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password validation:', isPasswordValid ? 'Valid' : 'Invalid');
      
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );
      
      console.log('Login successful for user:', user.email);
      
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          cnic: user.cnic,
          email: user.email,
          role: user.role,
          firstName: user.first_name,
          lastName: user.last_name
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Room Management Routes
app.get('/api/rooms', (req, res) => {
  const query = `
    SELECT r.*, rt.name as room_type_name, rt.description as room_type_description, rt.base_price
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.status = 'available'
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const roomId = req.params.id;
  const query = `
    SELECT r.*, rt.name as room_type_name, rt.description as room_type_description, rt.base_price
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.id = ?
  `;
  
  db.query(query, [roomId], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (results.length === 0) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(results[0]);
  });
});

// Booking Routes
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { roomId, checkInDate, checkOutDate, guests, specialRequests } = req.body;
    const userId = req.user.userId;
    
    // Check room availability
    const availabilityQuery = `
      SELECT * FROM bookings 
      WHERE room_id = ? 
      AND status IN ('unpaid','confirmed', 'checked_in') 
      AND NOT (check_out_date <= ? OR check_in_date >= ?)
    `;
    
    db.query(availabilityQuery, [roomId, checkInDate, checkOutDate], (err, conflicts) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      if (conflicts.length > 0) {
        return res.status(400).json({ message: 'Room not available for selected dates' });
      }
      
      // Calculate total price
      const priceQuery = `
        SELECT rt.base_price, DATEDIFF(?, ?) as nights
        FROM rooms r
        JOIN room_types rt ON r.room_type_id = rt.id
        WHERE r.id = ?
      `;
      
      db.query(priceQuery, [checkOutDate, checkInDate, roomId], (err, priceResults) => {
        if (err) {
          return res.status(500).json({ message: 'Database error' });
        }
        
        const { base_price, nights } = priceResults[0];
        const totalPrice = base_price * nights;
        
        // Create booking
        const bookingQuery = `
          INSERT INTO bookings (user_id, room_id, check_in_date, check_out_date, guests, total_price, special_requests, status, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, 'unpaid', NOW())
        `;
        
        db.query(bookingQuery, [userId, roomId, checkInDate, checkOutDate, guests, totalPrice, specialRequests], (err, result) => {
          if (err) {
            return res.status(500).json({ message: 'Failed to create booking' });
          }
          
          res.status(201).json({
            message: 'Booking created successfully',
            bookingId: result.insertId,
            totalPrice: totalPrice
          });
        });
      });
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;
  
  let query = `
    SELECT b.*, r.room_number, r.floor, rt.name as room_type_name, rt.base_price,
           u.first_name, u.last_name, u.email, u.phone
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    JOIN users u ON b.user_id = u.id
  `;
  
  let params = [];
  
  if (userRole === 'customer') {
    query += ' WHERE b.user_id = ?';
    params.push(userId);
  }
  
  query += ' ORDER BY b.created_at DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Admin Routes
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  // Get dashboard statistics using joins
  const statsQuery = `
    SELECT 
      (SELECT COUNT(*) FROM users WHERE role = 'customer') as total_customers,
      (SELECT COUNT(*) FROM rooms) as total_rooms,
      (SELECT COUNT(*) FROM bookings WHERE status = 'unpaid' OR status = 'confirmed') as active_bookings,
      (SELECT SUM(total_price) FROM bookings WHERE DATE(created_at) = CURDATE()) as today_revenue,
      (SELECT COUNT(*) FROM rooms WHERE status = 'available') as available_rooms
  `;
  
  db.query(statsQuery, (err, stats) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    // Get recent bookings with user and room details
    const recentBookingsQuery = `
      SELECT b.id, b.check_in_date, b.check_out_date, b.total_price, b.status,
             u.first_name, u.last_name, u.email,
             r.room_number, rt.name as room_type
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY b.created_at DESC
      LIMIT 10
    `;
    
    db.query(recentBookingsQuery, (err, bookings) => {
      if (err) {
        return res.status(500).json({ message: 'Database error' });
      }
      
      res.json({
        stats: stats[0],
        recentBookings: bookings
      });
    });
  });
});

// Update booking status endpoint
app.put('/api/admin/bookings/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const bookingId = req.params.id;
  const { status } = req.body;
  
  const updateQuery = 'UPDATE bookings SET status = ? WHERE id = ?';
  db.query(updateQuery, [status, bookingId], (err, result) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    
    res.json({ message: 'Booking status updated successfully' });
  });
});

// Get all bookings for admin
app.get('/api/admin/bookings', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const query = `
    SELECT b.*, r.room_number, r.floor, rt.name as room_type_name, rt.base_price,
           u.first_name, u.last_name, u.email, u.phone
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    JOIN users u ON b.user_id = u.id
    ORDER BY b.created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Get all users for admin
app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const query = `
    SELECT id, cnic, email, role, first_name, last_name, phone, created_at
    FROM users
    ORDER BY created_at DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Get all rooms for admin
app.get('/api/admin/rooms', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  
  const query = `
    SELECT r.*, rt.name as room_type_name, rt.description as room_type_description, rt.base_price
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    ORDER BY r.room_number
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Database error' });
    }
    res.json(results);
  });
});

// Database test endpoint for debugging
app.get('/api/test/db', (req, res) => {
  console.log('Testing database connection...');
  
  // Test basic connection
  db.query('SELECT 1 + 1 AS result', (err, results) => {
    if (err) {
      console.error('Database test failed:', err);
      return res.status(500).json({
        success: false,
        message: 'Database connection failed',
        error: err.message,
        code: err.code
      });
    }
    
    // Test if users table exists
    db.query('SELECT COUNT(*) as userCount FROM users', (err2, userResults) => {
      if (err2) {
        console.error('Users table test failed:', err2);
        return res.json({
          success: true,
          message: 'Database connected but users table missing',
          basicConnection: true,
          usersTable: false,
          error: err2.message
        });
      }
      
      console.log('Database test successful');
      res.json({
        success: true,
        message: 'Database connection successful',
        basicConnection: true,
        usersTable: true,
        userCount: userResults[0].userCount,
        database: process.env.DB_NAME || 'hotel_management'
      });
    });
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Express error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Hotel Management Server is running' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Hotel Management Server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoints available:`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/login`);
  console.log(`   - POST /api/register`);
  console.log(`   - GET  /api/rooms`);
  console.log(`   - GET  /api/test/db`);
  console.log(`🌐 Frontend should connect to: http://localhost:${PORT}`);
  console.log(`⏰ Server started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.end();
  process.exit(0);
});

module.exports = app;