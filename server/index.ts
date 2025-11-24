const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hotel_management',
  connectTimeout: 60000,
  acquireTimeout: 60000
});

db.connect((err) => {
  if (err) {
    console.error('[FAIL] Database connection failed:', err.message);
  } else {
    console.log('Connected to MySQL database:', process.env.DB_NAME || 'hotel_management');
  }
});

db.on('error', (err) => {
  console.error('Database error:', err);
});

// JWT middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Helper: isAdmin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

// --------------------------
// Authentication routes
// --------------------------
app.post('/api/register', async (req, res) => {
  try {
    const {email, password, role = 'customer', firstName, lastName, phone, cnic } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const checkQ = 'SELECT id FROM users WHERE email = ? OR cnic = ?';
    db.query(checkQ, [email, cnic || null], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length > 0) return res.status(400).json({ message: 'User already exists' });

      const hashed = await bcrypt.hash(password, 10);
      const insUserQ = `INSERT INTO users (cnic, email, password, role, first_name, last_name, phone, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`;
      db.query(insUserQ, [cnic, email, hashed, role, firstName, lastName, phone], (err, result) => {
        if (err) return res.status(500).json({ message: 'Failed to create user' });

        const userId = result.insertId;
        if (role === 'customer') {
          const insCustQ = `INSERT INTO customers (user_id, phone, cnic, created_at) VALUES (?, ?, ?, NOW())`;
          db.query(insCustQ, [userId, phone || null, cnic || null], (err2) => {
            if (err2) console.warn('Warning: failed to create customer extension:', err2.message);
            return res.status(201).json({ message: 'User created', userId });
          });
        } else {
          return res.status(201).json({ message: 'User created', userId });
        }
      });
    });
  } catch (e) {
    return res.status(500).json({ message: 'Server error', error: e.message });
  }
});

app.post('/api/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const q = 'SELECT * FROM users WHERE email = ?';
    db.query(q, [email], async (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (results.length === 0) return res.status(401).json({ message: 'Invalid credentials' });

      const user = results[0];
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,email: user.email, role: user.role,
          firstName: user.first_name, lastName: user.last_name, phone: user.phone
        }
      });
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// --------------------------
// Rooms & Room types
// --------------------------
app.get('/api/room-types', (req, res) => {
  const q = 'SELECT * FROM room_types ORDER BY name';
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.get('/api/rooms', (req, res) => {
  const { status, room_type_id, min_price, max_price } = req.query;
  let q = `
    SELECT r.id, r.room_number, r.floor, r.status, COALESCE(r.price_per_night, rt.base_price) AS price_per_night,
           rt.id AS room_type_id, rt.name AS room_type_name, rt.description as room_type_description,rt.max_occupancy,rt.amenities
    FROM rooms r
    JOIN room_types rt ON r.room_type_id = rt.id
    WHERE 1=1
  `;
  const params = [];
  if (status) { q += ' AND r.status = ?'; params.push(status); }
  if (room_type_id) { q += ' AND r.room_type_id = ?'; params.push(room_type_id); }
  if (min_price) { q += ' AND COALESCE(r.price_per_night, rt.base_price) >= ?'; params.push(min_price); }
  if (max_price) { q += ' AND COALESCE(r.price_per_night, rt.base_price) <= ?'; params.push(max_price); }
  q += ' ORDER BY r.room_number';

  db.query(q, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

app.get('/api/rooms/:id', (req, res) => {
  const id = req.params.id;
  const q = `
    SELECT r.*, rt.name as room_type_name, rt.base_price
    FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
    WHERE r.id = ?
  `;
  db.query(q, [id], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (rows.length === 0) return res.status(404).json({ message: 'Room not found' });
    res.json(rows[0]);
  });
});


app.get('/api/room-images/:roomTypeId', async (req, res) => {
  const roomTypeId = req.params.roomTypeId;
  console.log(roomTypeId);
 
  const query = 'SELECT room_image_folder FROM room_types WHERE id = ?';
  db.query(query, [roomTypeId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (rows.length === 0) return res.status(404).json({ message: 'Room type not found' });

    const folderPath = rows[0].room_image_folder;

    fs.readdir(folderPath, (err2, files) => {
      if (err2) return res.status(500).json({ message: 'Failed to read folder', error: err2.message });

      const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));

      const imageUrls = imageFiles.map(f => `${req.protocol}://${req.get('host')}/${folderPath}/${f}`);

      res.json({ images: imageUrls });
    });
  });
});


app.put('/api/rooms/update-status',authenticateToken, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const [result] = await db.query(`
      UPDATE rooms r
      JOIN bookings b ON r.id = b.room_id
      SET r.status = 'available'
      WHERE b.check_out_date < CURDATE() AND r.status = 'occupied'
    `);

    res.json({ message: 'Rooms updated', affectedRows: result.affectedRows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// --------------------------
// Bookings
// --------------------------

app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const { room_id, check_in_date, check_out_date, guests = 1, special_requests } = req.body;
    const userId = req.user.userId;

    if (!room_id || !check_in_date || !check_out_date)
      return res.status(400).json({ message: 'Required fields missing' });

    // Find customer id for this user
    db.query('SELECT id FROM customers WHERE user_id = ?', [userId], (err, custRows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (custRows.length === 0) return res.status(400).json({ message: 'Customer profile not found' });

      const customerId = custRows[0].id;

      // Check availability 
      const availQ = `
        SELECT * FROM bookings
        WHERE room_id = ? AND booking_status IN ('confirmed','checked_in')
          AND NOT (check_out_date <= ? OR check_in_date >= ?)
      `;
      db.query(availQ, [room_id, check_in_date, check_out_date], (err2, conflicts) => {
        if (err2) return res.status(500).json({ message: 'Database error' });
        if (conflicts.length > 0) return res.status(400).json({ message: 'Room not available for selected dates' });

        // Price calculation:
        const priceQ = `
          SELECT COALESCE(r.price_per_night, rt.base_price) AS price
          FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
          WHERE r.id = ?
        `;
        db.query(priceQ, [room_id], (err3, priceRows) => {
          if (err3) return res.status(500).json({ message: 'Database error' });
          if (priceRows.length === 0) return res.status(404).json({ message: 'Room not found' });


          // Calculate nights 
          const nightsQ = `SELECT DATEDIFF(?,?) AS nights`;
          db.query(nightsQ, [check_out_date, check_in_date], (err4, nightsRows) => {
            if (err4) return res.status(500).json({ message: 'Database error' });
            const nights = Math.max(1, nightsRows[0].nights || 1);
            const total = Number(priceRows[0].price) * nights;

            const insQ = `
              INSERT INTO bookings (customer_id, room_id, booking_status, check_in_date, check_out_date, guests, total_amount, special_requests, created_at)
              VALUES (?, ?, 'unpaid', ?, ?, ?, ?, ?, NOW())
            `;
            db.query(insQ, [customerId, room_id, check_in_date, check_out_date, guests, total, special_requests || null], (err5, result) => {
              if (err5) return res.status(500).json({ message: 'Failed to create booking', error: err5.message });
              
              const updateRoomQ = `
                UPDATE rooms
                SET status = 'occupied'
                WHERE id = ?
              `;
              db.query(updateRoomQ, [room_id], (err6) => {
                if (err6) console.error('Failed to update room status:', err6.message);
              });
              

              return res.status(201).json({ message: 'Booking created', bookingId: result.insertId, totalAmount: total });
            });
          });
        });
      });
    });

  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// Get bookings for authenticated user (customers) or all if admin/staff
app.get('/api/bookings', authenticateToken, (req, res) => {
  const role = req.user.role;
  const userId = req.user.userId;

  let q = `
    SELECT b.*, r.room_number, r.floor, rt.name as room_type_name, c.id as customer_id, u.email,u.first_name,u.last_name
    FROM bookings b
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id
    JOIN customers c ON b.customer_id = c.id
    JOIN users u ON c.user_id = u.id
  `;
  const params = [];
  if (role === 'customer') {
    q += ' WHERE c.user_id = ?';
    params.push(userId);
  }
  q += ' ORDER BY b.created_at DESC';

  db.query(q, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// Admin: update booking status
app.put('/api/admin/bookings/:id', authenticateToken, requireAdmin, (req, res) => {
  const bookingId = req.params.id;
  const { status } = req.body;
  if (!status) return res.status(400).json({ message: 'Status required' });

  const upQ = 'UPDATE bookings SET booking_status = ?, updated_at = NOW() WHERE id = ?';
  db.query(upQ, [status, bookingId], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Booking not found' });
    return res.json({ message: 'Booking status updated' });
  });
});

// --------------------------
// Transactions / Payments
// --------------------------
app.post('/api/transactions', authenticateToken, (req, res) => {
  try {
    const { booking_id, amount, payment_method} = req.body;
    if (!booking_id || !amount) return res.status(400).json({ message: 'booking_id and amount required' });

    const insQ = `INSERT INTO transactions (booking_id, amount, payment_method, payment_status, created_at)
                  VALUES (?, ?, ?, 'completed',NOW())`;
    db.query(insQ, [booking_id, amount, payment_method || 'cash'], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      
      const updBookingQ = `UPDATE bookings SET booking_status = 'confirmed' WHERE id = ?`;
      db.query(updBookingQ, [booking_id], () => { });

      res.status(201).json({ message: 'Transaction recorded', transactionId: result.insertId });
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// --------------------------
// Reviews
// --------------------------
app.post('/api/reviews', authenticateToken, (req, res) => {
  try {
    const { booking_id, rating, comment } = req.body;
    if (!booking_id || !rating) return res.status(400).json({ message: 'booking_id and rating required' });
    const userId = req.user.userId;
    const checkQ = `
      SELECT b.* FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      WHERE b.id = ? AND c.user_id = ?
    `;
    db.query(checkQ, [booking_id, userId], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      if (rows.length === 0) return res.status(403).json({ message: 'Booking does not belong to you' });

      const customerId = rows[0].customer_id;
      const insQ = `INSERT INTO reviews (booking_id, customer_id, rating, comment, review_date, created_at)
                    VALUES (?, ?, ?, ?, CURRENT_DATE(), NOW())`;
      db.query(insQ, [booking_id, customerId, rating, comment || null], (err2, result) => {
        if (err2) {
          
          if (err2.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Review already submitted for this booking' });
          return res.status(500).json({ message: 'Database error', error: err2.message });
        }
        res.status(201).json({ message: 'Review submitted', reviewId: result.insertId });
      });
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// --------------------------
// Cleaning requests
// --------------------------
app.get('/api/cleaning-requests', (req, res) => {
  const q = 'SELECT * FROM cleaning_requests ORDER BY request_date';
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});



app.post('/api/cleaning-requests', authenticateToken, (req, res) => {
  try {
    const { booking_id, request_type, notes } = req.body;
    if (!booking_id || !request_type) return res.status(400).json({ message: 'booking_id and request_type required' });

    const insQ = `INSERT INTO cleaning_requests (booking_id, request_type, notes, status, request_date)
                  VALUES (?, ?, ?, 'pending', NOW())`;
    db.query(insQ, [booking_id, request_type, notes || null], (err, result) => {
      if (err) return res.status(500).json({ message: 'Database error' });
      res.status(201).json({ message: 'Cleaning request created', requestId: result.insertId });
    });
  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});


app.put('/api/admin/cleaning-requests/assign', authenticateToken, requireAdmin, (req, res) => {
  const { cleaning_id,staff_id } = req.body;
  if (!staff_id || !cleaning_id) return res.status(400).json({ message: 'staff_id or cleaning_id required' });

  const updQ = `UPDATE cleaning_requests SET staff_id = ?, status = 'assigned' WHERE id = ?`;
  db.query(updQ, [staff_id, cleaning_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Cleaning request assigned' });
  });
});


app.put('/api/cleaning-requests/update',authenticateToken, (req, res) => {
  const { cleaning_id,status} = req.body;
  if (!cleaning_id) return res.status(400).json({ message: 'cleaning_id required' });

  const updQ = `UPDATE cleaning_requests SET status = ? WHERE id = ?`;
  db.query(updQ, [status,cleaning_id], (err, result) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Request not found' });
    res.json({ message: 'Cleaning request assigned' });
  });
});

app.post('/api/create-activity-log', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { action } = req.body;
  try {
    const staffQuery = `SELECT id FROM staff WHERE user_id = ?`;
    db.query(staffQuery, [userId], (err, results) => {
      if (err) return res.status(500).json({ message: 'Database error (staff lookup)' });
      if (results.length === 0) {
        return res.status(404).json({ message: 'Staff member not found for this user' });
      }
      const staff_id = results[0].id;

      const insQ = `
        INSERT INTO activity_log (staff_id, timestamp, action)
        VALUES (?, NOW(), ?)
      `;
      db.query(insQ, [staff_id, action || null], (err, result) => {
        if (err) return res.status(500).json({ message: 'Database error (insert log)' });

        res.status(201).json({
          message: 'Activity log created',
          logId: result.insertId
        });
      });
    });

  } catch (e) {
    res.status(500).json({ message: 'Server error', error: e.message });
  }
});

// 
app.get('/api/cleaning-request-details', authenticateToken, (req, res) => {
  const role = req.user.role;
  const userId = req.user.userId;

  let q = `
    SELECT cr.*,r.room_number,r.floor,rt.name AS room_type_name
    FROM cleaning_requests cr
    JOIN cleaning_staff cs ON cr.staff_id = cs.staff_id
    JOIN staff s ON cs.staff_id = s.id
    JOIN bookings b ON cr.booking_id = b.id
    JOIN rooms r ON b.room_id = r.id
    JOIN room_types rt ON r.room_type_id = rt.id

  `;
  const params = [];
  if (role === 'staff') {
    q += ' WHERE s.user_id = ?';
    params.push(userId);
  }
  q += ' ORDER BY cr.request_date DESC';

  db.query(q, params, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});



// --------------------------
// Admin dashboard (stats)
// --------------------------
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, (req, res) => {
  const statsQ = `
    SELECT
      (SELECT COUNT(*) FROM customers) as total_customers,
      (SELECT COUNT(*) FROM rooms) as total_rooms,
      (SELECT COUNT(*) FROM bookings WHERE booking_status = 'confirmed' and check_out_date >= CURDATE()) as active_bookings,
      (SELECT SUM(total_amount) FROM bookings WHERE DATE(created_at) = CURDATE()) as today_revenue,
      (SELECT COUNT(*) FROM rooms WHERE status = 'available') as available_rooms
  `;
  db.query(statsQ, (err, statsRows) => {
    if (err) return res.status(500).json({ message: 'Database error' });

    const recentQ = `
      SELECT b.id, b.check_in_date, b.check_out_date, b.total_amount, b.booking_status,
             u.first_name, u.last_name, r.room_number, rt.name as room_type
      FROM bookings b
      JOIN customers c ON b.customer_id = c.id
      JOIN users u ON c.user_id = u.id
      JOIN rooms r ON b.room_id = r.id
      JOIN room_types rt ON r.room_type_id = rt.id
      ORDER BY b.created_at DESC LIMIT 10
    `;
    db.query(recentQ, (err2, recent) => {
      if (err2) return res.status(500).json({ message: 'Database error' });
      res.json({ stats: statsRows[0], recentBookings: recent });
    });
  });
});


app.get('/api/admin/report', authenticateToken, requireAdmin, (req, res) => {
  const statsQ = `
    SELECT
      (SELECT COUNT(*) FROM users) AS users,
      (SELECT COUNT(*) FROM customers) AS total_customers,
      (SELECT COUNT(*) FROM staff) AS total_staff,
      (SELECT COUNT(*) FROM rooms) AS total_rooms,


      (SELECT COUNT(*) 
         FROM bookings 
         WHERE booking_status = 'confirmed'
           AND MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at) = YEAR(CURDATE())
      ) AS total_bookings,

      (SELECT COUNT(*)
         FROM transactions
         WHERE payment_status = 'completed'
           AND MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at) = YEAR(CURDATE())
      ) AS total_transactions,


      (SELECT SUM(total_amount)
         FROM bookings
         WHERE MONTH(created_at) = MONTH(CURDATE())
           AND YEAR(created_at) = YEAR(CURDATE())
      ) AS total_revenue
  `;

  db.query(statsQ, (err, statsRows) => {
    if (err) return res.status(500).json({ message: 'Database error in stats', error: err });

    // Query all transactions for the current month
    const transactionsQ = `
      SELECT *
      FROM transactions
      WHERE MONTH(created_at) = MONTH(CURDATE())
        AND YEAR(created_at) = YEAR(CURDATE())
    `;

    db.query(transactionsQ, (err2, transactionsRows) => {
      if (err2) return res.status(500).json({ message: 'Database error in transactions', error: err2 });

      res.json({
        stats: statsRows[0],
        transactions: transactionsRows
      });
    });
  });
});







// --------------------------
// Admin: users & rooms endpoints
// --------------------------
app.get('/api/admin/users', authenticateToken, requireAdmin, (req, res) => {
  const q = 'SELECT id, cnic, email, role, first_name, last_name, phone, created_at FROM users ORDER BY created_at DESC';
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});


app.get('/api/admin/customers', authenticateToken, requireAdmin, (req, res) => {
  const q = `
    SELECT c.id as customer_id,c.user_id,c.phone, u.email,u.first_name,u.last_name,u.created_at
    FROM customers c
    JOIN users u ON c.user_id = u.id
    ORDER BY u.created_at DESC
  `;
  
  // const q = 'SELECT id, cnic, email, role, first_name, last_name, phone, created_at FROM users ORDER BY created_at DESC';
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});


app.get('/api/admin/staff', authenticateToken, requireAdmin, (req, res) => {
  const q = `
    SELECT s.id as staff_id,s.user_id,s.phone,s.hire_date,s.salary,s.role, u.email,u.first_name,u.last_name,u.created_at
    FROM staff s
    JOIN users u ON s.user_id = u.id
    ORDER BY u.created_at DESC
  `;
  
  // const q = 'SELECT id, cnic, email, role, first_name, last_name, phone, created_at FROM users ORDER BY created_at DESC';
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});



app.get('/api/admin/rooms', authenticateToken, requireAdmin, (req, res) => {
  const q = `
    SELECT r.*, rt.name as room_type_name, COALESCE(r.price_per_night, rt.base_price) as effective_price
    FROM rooms r JOIN room_types rt ON r.room_type_id = rt.id
    ORDER BY r.room_number
  `;
  db.query(q, (err, rows) => {
    if (err) return res.status(500).json({ message: 'Database error' });
    res.json(rows);
  });
});

// --------------------------
// Debug / health
// --------------------------
app.get('/api/test/db', (req, res) => {
  db.query('SELECT 1 + 1 AS result', (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'DB connection failed', error: err.message });
    }
    db.query('SELECT COUNT(*) as usersCount FROM users', (err2, urows) => {
      if (err2) {
        return res.json({ success: true, message: 'Connected but users table missing', basicConnection: true, usersTable: false, error: err2.message });
      }
      res.json({ success: true, message: 'Database ok', basicConnection: true, usersTable: true, usersCount: urows[0].usersCount, db: process.env.DB_NAME || 'hotel_management' });
    });
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString(), message: 'Hotel Management Server is running' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Express error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down server...');
  db.end();
  process.exit(0);
});

module.exports = app;