export {};
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

async function setup() {
  let connection;
  
  try {
    console.log('Connecting to database...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected to database successfully');

    // First, clean up existing data to avoid conflicts
    console.log('🧹 Cleaning up existing data...');
    await connection.execute('DELETE FROM booking_services');
    await connection.execute('DELETE FROM services');

    await connection.execute('DELETE FROM cleaning_requests');
    await connection.execute('DELETE FROM activity_log');

    await connection.execute('DELETE FROM bookings');

    await connection.execute('DELETE FROM admin');
    await connection.execute('DELETE FROM receptionist');
    await connection.execute('DELETE FROM cleaning_staff');

    await connection.execute('DELETE FROM staff');
    await connection.execute('DELETE FROM customers');

    await connection.execute('DELETE FROM rooms');
    await connection.execute('DELETE FROM room_types');

    await connection.execute('DELETE FROM users');
    console.log('Cleaned up existing data');

    // Create demo users with hashed passwords
    console.log('Creating demo users...');
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const customerPasswordHash = await bcrypt.hash('customer123', 10);
    const receptionistPasswordHash = await bcrypt.hash('reception123', 10);
    const staffPasswordHash = await bcrypt.hash('staff123', 10);
      const [adminResult] = await connection.execute(
      'INSERT INTO users (cnic, email, password, role, first_name, last_name,phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['5353535355', 'admin@hotel.com', adminPasswordHash, 'admin', 'Admin', 'User','+1000000000']

    );
    const [asresult] = await connection.execute(
      'INSERT INTO staff (user_id,cnic,phone,hire_date,role) VALUES (?, ?, ?, ?, ?)',
      [adminResult.insertId,'5353535355','+1000000000','2020-12-01','admin']
    )
    await connection.execute(
      'INSERT INTO admin (staff_id,access_level) VALUES (?, ?)',
      [asresult.insertId,'super']
    )
    console.log(`Created admin user with ID: ${adminResult.insertId}`);
    

    const [customerResult] = await connection.execute(
      'INSERT INTO users (cnic, email, password, role, first_name, last_name,phone) VALUES (?, ?, ?, ?, ?, ?, ?)',
      ['1325429499', 'ali@example.com', customerPasswordHash, 'customer', 'Ali', 'Haider','+1000079601']
    );
    await connection.execute(
      'INSERT INTO customers (user_id,cnic,phone) VALUES (?, ?, ?)',
      [customerResult.insertId,'1325429499','+1000079601']
    )
    console.log(`Created customer user with ID: ${customerResult.insertId}`);
    
    const [receptionResult] = await connection.execute(
      'INSERT INTO users (cnic, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      ['948472900003', 'receptionist@example.com', receptionistPasswordHash, 'receptionist', 'Alice', 'Parker']
    );
    const [rsresult] = await connection.execute(
      'INSERT INTO staff (user_id,cnic,hire_date,role) VALUES (?, ?, ?, ?)',
      [receptionResult.insertId,'948472900003','2015-11-04','receptionist']
    )
    await connection.execute(
      'INSERT INTO receptionist (staff_id,desk_number) VALUES (?, ?)',
      [rsresult.insertId,'5']
    )
    console.log(`Create receptionist with ID: ${receptionResult.insertId}`);


    const [staffResult] = await connection.execute(
      'INSERT INTO users (cnic, email, password, role, first_name, last_name) VALUES (?, ?, ?, ?, ?, ?)',
      ['84020499444', 'cleaningstaff@example.com', staffPasswordHash, 'staff', 'Brian', 'Shaw']
    );
    const [ssresult] = await connection.execute(
      'INSERT INTO staff (user_id,cnic,hire_date,role) VALUES (?, ?, ?, ?)',
      [staffResult.insertId,'84020499444','2018-09-04','cleaning']
    )
    await connection.execute(
      'INSERT INTO cleaning_staff (staff_id,cleaning_zone) VALUES (?, ?)',
      [ssresult.insertId,'all floors']
    )
    console.log(`Created staff user with ID: ${staffResult.insertId}`);

    // Create room types
    console.log('Creating room types...');    
    
    const roomTypes = [
      ['Standard Single', 'Basic single room', 50.00, 1, '["WiFi","TV","AC"]','uploads/room_types/single/'],
      ['Standard Double', 'Double room', 80.00, 2, '["WiFi","TV","AC","Mini Bar"]' ,'uploads/room_types/double/'],
      ['Deluxe Suite', 'Suite', 220.00, 4, '["WiFi","TV","AC","Balcony","Room Service"]', 'uploads/room_types/deluxe/'],
    ];

    const roomTypeIds = [];
    for (const [name, description, price, capacity,amenity,roomimagefolder] of roomTypes) {
      const [result] = await connection.execute(
        'INSERT INTO room_types (name, description, base_price, max_occupancy,amenities,room_image_folder) VALUES (?, ?, ?, ?,?,?)',
        [name, description, price, capacity,amenity,roomimagefolder]
      );
      roomTypeIds.push(result.insertId);
      console.log(`Created room type: ${name} (ID: ${result.insertId})`);
    }    // Create rooms using the actual room type IDs
    console.log('Creating rooms...');
    const rooms = [
      [101, roomTypeIds[0], 1,50.00], // Standard Double, Floor 1
      [102, roomTypeIds[0], 1,50.00], // Standard Double, Floor 1
      [103, roomTypeIds[0], 1,50.00], // Standard Double, Floor 1
      [201, roomTypeIds[1], 2,80.00], // Deluxe Suite, Floor 2
      [202, roomTypeIds[1], 2,80.00], // Deluxe Suite, Floor 2
      [301, roomTypeIds[2], 3,220.00], // Family Room, Floor 3
      [302, roomTypeIds[2], 3,220.00], // Family Room, Floor 3
      [401, roomTypeIds[2], 4,220.00]  // Presidential Suite, Floor 4
    ];

    for (const [roomNumber, roomTypeId, floor,price] of rooms) {
      await connection.execute(
        'INSERT INTO rooms (room_number, room_type_id, floor, status,price_per_night) VALUES (?, ?, ?, ?,?)',
        [roomNumber, roomTypeId, floor, 'available',price]
      );
      console.log(`Created room: ${roomNumber}`);
    }    // Create services
    console.log('Creating services...');
    const services = [
      ['Room Service', 'Convenient room service for meals and drinks', 25.00, 'food'],
      ['Spa Treatment', 'Relaxing spa and wellness treatments', 80.00, 'spa'],
      ['Airport Transfer', 'Comfortable transfer to/from airport', 45.00, 'transport'],
      ['Laundry Service', 'Professional laundry and dry cleaning', 15.00, 'laundry'],
      ['Car Rental', 'Convenient car rental service', 60.00, 'other']
    ];

    for (const [name, description, price, category] of services) {
      await connection.execute(
        'INSERT INTO services (name, description, price, category) VALUES (?, ?, ?, ?)',
        [name, description, price, category]
      );
      console.log(`Created service: ${name}`);
    }

    // Verify the setup
    console.log('\nSetup Summary:');
    
    const [userCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
    console.log(`Users: ${userCount[0].count}`);
    
    const [roomTypeCount] = await connection.execute('SELECT COUNT(*) as count FROM room_types');
    console.log(`Room Types: ${roomTypeCount[0].count}`);
    
    const [roomCount] = await connection.execute('SELECT COUNT(*) as count FROM rooms');
    console.log(`Rooms: ${roomCount[0].count}`);
    
    const [serviceCount] = await connection.execute('SELECT COUNT(*) as count FROM services');
    console.log(`Services: ${serviceCount[0].count}`);

    console.log('\nSetup completed successfully!');
    // console.log('\nDemo Accounts:');
    // console.log(' Admin: admin@hotel.com / admin123');
    // console.log(' Customer: john@example.com / customer123');
    // console.log(' Customer: john@example.com / customer123');
    // console.log(' Customer: john@example.com / customer123');

  } catch (error) {
    console.error('[FAIL] Setup failed:', error.message);
    if (error.code) {
      console.error('[FAIL] Error code:', error.code);
    }
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

setup().catch(error => {
  console.error('[FAIL] Unhandled error:', error);
  process.exit(1);
});