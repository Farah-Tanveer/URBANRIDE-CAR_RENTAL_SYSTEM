require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const oracledb = require('oracledb');
const { initPool, getConnection, closePool } = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'change-me';

app.use(cors({ origin: '*', credentials: false }));
app.use(express.json());

// Simple auth middleware for protected routes
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) {
    return res.status(401).json({ error: 'Missing token' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'API is running' });
});

// Auth: sign up with improved validation
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, phone } = req.body || {};
  
  // Validation
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, and password are required' });
  }
  
  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Password length validation
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long' });
  }
  
  try {
    const conn = await getConnection();
    
    // Check if email already exists in AppUser
    const existingUser = await conn.execute(
      'SELECT ID FROM AppUser WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    if (existingUser.rows && existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already exists. Please use a different email or try logging in.' });
    }

    // Check if email already exists in Customer
    const existingCustomer = await conn.execute(
      'SELECT ID FROM Customer WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    if (existingCustomer.rows && existingCustomer.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered as customer' });
    }
    
    // Check if phone already exists (if provided)
    if (phone) {
      const existingPhone = await conn.execute(
        'SELECT ID FROM Customer WHERE PhoneNumber = :phone',
        { phone }
      );
      if (existingPhone.rows && existingPhone.rows.length > 0) {
        return res.status(409).json({ error: 'Phone number already exists. Please use a different phone number.' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    
    // Insert into AppUser
    const userResult = await conn.execute(
      `INSERT INTO AppUser (ID, FullName, Email, PasswordHash, Phone)
       VALUES (appuser_seq.NEXTVAL, :fullName, :email, :passwordHash, :phone)`,
      {
        fullName,
        email,
        passwordHash,
        phone: phone || null
      }
    );

    // Get the inserted user ID
    const userIdResult = await conn.execute(
      'SELECT ID FROM AppUser WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    const userId = userIdResult.rows[0].ID;

    // Split fullName into FirstName and LastName
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || fullName;
    const lastName = nameParts.slice(1).join(' ') || fullName;

    // Create Customer record - use a default phone if not provided
    const customerPhone = phone && phone.trim() ? phone.trim() : '0000000000';
    
    try {
      await conn.execute(
        `INSERT INTO Customer (ID, FirstName, LastName, PhoneNumber, Email, Address, BlackListStatus)
         VALUES (seq_customer.NEXTVAL, :firstName, :lastName, :phone, :email, NULL, 'N')`,
        {
          firstName,
          lastName,
          phone: customerPhone,
          email
        }
      );
    } catch (customerErr) {
      // If customer insert fails (e.g., phone already exists), continue anyway
      console.warn('Customer record creation warning:', customerErr.message);
      // Don't fail signup if customer creation has issues - user can still login
    }

    const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ token, user: { id: userId, fullName, email, phone } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
});

// Helper function to get or create Customer ID from AppUser
async function getCustomerIdFromAppUser(conn, appUserId, email, fullName, phone) {
  // Try to find existing Customer by email
  const customerResult = await conn.execute(
    'SELECT ID FROM Customer WHERE LOWER(Email) = LOWER(:email)',
    { email }
  );
  
  if (customerResult.rows && customerResult.rows.length > 0) {
    return customerResult.rows[0].ID;
  }
  
  // Create Customer if not exists
  const nameParts = fullName.trim().split(/\s+/);
  const firstName = nameParts[0] || fullName;
  const lastName = nameParts.slice(1).join(' ') || fullName;
  
  await conn.execute(
    `INSERT INTO Customer (ID, FirstName, LastName, PhoneNumber, Email, Address, BlackListStatus)
     VALUES (seq_customer.NEXTVAL, :firstName, :lastName, :phone, :email, NULL, 'N')`,
    {
      firstName,
      lastName,
      phone: phone || '0000000000',
      email
    }
  );
  
  const newCustomerResult = await conn.execute(
    'SELECT ID FROM Customer WHERE LOWER(Email) = LOWER(:email)',
    { email }
  );
  
  return newCustomerResult.rows[0].ID;
}

// Auth: login with improved error messages
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      'SELECT ID, FullName, Email, PasswordHash, Phone FROM AppUser WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    const user = result.rows?.[0];
    if (!user) {
      return res.status(401).json({ error: 'User not found. Please check your email or sign up.' });
    }
    const valid = await bcrypt.compare(password, user.PASSWORDHASH);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });
    }
    
    // Ensure Customer record exists
    const customerId = await getCustomerIdFromAppUser(
      conn,
      user.ID,
      user.EMAIL,
      user.FULLNAME,
      user.PHONE
    );
    
    const token = jwt.sign({ sub: user.ID, email: user.EMAIL, customerId }, JWT_SECRET, { expiresIn: '2h' });
    res.json({
      token,
      user: {
        id: user.ID,
        fullName: user.FULLNAME,
        email: user.EMAIL,
        phone: user.PHONE,
        customerId
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// Fleet sample endpoint
app.get('/api/fleet', async (_req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT v.ID, v.Description, v.Color, v.DailyRate, v.Status, pn.PlateNumber, c.Name AS Company
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       FETCH FIRST 20 ROWS ONLY`
    );
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Fleet fetch error:', err);
    res.status(500).json({ error: 'Could not fetch fleet', detail: err.message });
  }
});

// Available cars between date range
app.get('/api/cars/available', async (req, res) => {
  const { start, end } = req.query;
  if (!start || !end) {
    return res.status(400).json({ error: 'start and end (YYYY-MM-DD) are required' });
  }
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              v.Status,
              pn.PlateNumber AS PLATENUMBER,
              c.Name AS Company,
              NVL(d.damage_count, 0) AS DamageCount
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       LEFT JOIN (
         SELECT Vehicle_id, COUNT(*) AS damage_count
         FROM Damage_Report
         GROUP BY Vehicle_id
       ) d ON d.Vehicle_id = v.ID
       WHERE UPPER(v.Status) = 'AVAILABLE'
         AND v.ID NOT IN (
           SELECT r.Vehicle_id
           FROM Reservation r
           WHERE UPPER(r.Status) = 'RESERVED'
             AND NOT (
               r.Rent_EndDate < TO_DATE(:start, 'YYYY-MM-DD')
               OR r.Rent_StartDate > TO_DATE(:end, 'YYYY-MM-DD')
             )
         )
       ORDER BY v.DailyRate`,
      { start, end }
    );
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Available cars error:', err);
    res.status(500).json({ error: 'Could not fetch available cars', detail: err.message });
  }
});

// Cars with maintenance records - also show cars with Status = 'MAINTENANCE'
app.get('/api/cars/maintenance', async (_req, res) => {
  try {
    const conn = await getConnection();
    // Get cars that are currently under maintenance OR have recent maintenance records
    const result = await conn.execute(
      `SELECT DISTINCT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              pn.PlateNumber AS PLATENUMBER,
              m.MaintenanceDate AS MAINTENANCEDATE,
              m.Description AS MaintenanceDescription,
              m.Cost,
              v.Status
       FROM Vehicle v
       LEFT JOIN Maintenance m ON m.Vehicle_id = v.ID
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       WHERE v.Status = 'MAINTENANCE' OR m.MaintenanceDate IS NOT NULL
       ORDER BY COALESCE(m.MaintenanceDate, DATE '1900-01-01') DESC, v.ID`
    );
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Maintenance cars error:', err);
    res.status(500).json({ error: 'Could not fetch maintenance cars', detail: err.message });
  }
});

// Reserved cars (currently reserved)
app.get('/api/cars/reserved', async (req, res) => {
  const { start, end } = req.query;
  try {
    const conn = await getConnection();
    let query = `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              pn.PlateNumber AS PLATENUMBER,
              c.Name AS Company,
              r.Rent_StartDate AS RENT_STARTDATE,
              r.Rent_EndDate AS RENT_ENDDATE,
              r.Status AS ReservationStatus,
              cust.FirstName || ' ' || cust.LastName AS CUSTOMERNAME
       FROM Reservation r
       JOIN Vehicle v ON v.ID = r.Vehicle_id
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       LEFT JOIN Customer cust ON cust.ID = r.Customer_id
       WHERE UPPER(r.Status) = 'RESERVED'`;
    
    const binds = {};
    if (start && end) {
      query += ` AND (
        (r.Rent_StartDate <= TO_DATE(:end, 'YYYY-MM-DD') AND r.Rent_EndDate >= TO_DATE(:start, 'YYYY-MM-DD'))
      )`;
      binds.start = start;
      binds.end = end;
    }
    
    query += ` ORDER BY r.Rent_StartDate DESC`;
    
    const result = await conn.execute(query, binds);
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Reserved cars error:', err);
    res.status(500).json({ error: 'Could not fetch reserved cars', detail: err.message });
  }
});

// Damage history for a specific car
app.get('/api/cars/:id/damage-history', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT ID,
              SeverityLevel,
              Description,
              EstimatedCost,
              ReportDate
       FROM Damage_Report
       WHERE Vehicle_id = :id
       ORDER BY ReportDate DESC`,
      { id }
    );
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Damage history error:', err);
    res.status(500).json({ error: 'Could not fetch damage history', detail: err.message });
  }
});

// Get cars by category (FEATURE 1 & 3)
// Works even if Category field doesn't exist - infers from DailyRate
app.get('/api/cars/category/:category', async (req, res) => {
  const { category } = req.params;
  const { includeUnavailable } = req.query;
  
  // Normalize category to lowercase
  const categoryLower = category.toLowerCase();
  if (!['economy', 'suv', 'luxury', 'all'].includes(categoryLower)) {
    return res.status(400).json({ error: 'Invalid category. Must be: economy, suv, luxury, or all' });
  }
  
  try {
    const conn = await getConnection();
    
    // Define category ranges based on DailyRate (in case Category field doesn't exist)
    let rateCondition = '1=1'; // Default true for 'all'
    if (categoryLower === 'economy') {
      rateCondition = 'v.DailyRate <= 50';
    } else if (categoryLower === 'suv') {
      rateCondition = 'v.DailyRate > 50 AND v.DailyRate <= 100';
    } else if (categoryLower === 'luxury') {
      rateCondition = 'v.DailyRate > 100';
    }
    
    // Try to use Category field if it exists, otherwise use DailyRate inference
    let query = `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              v.Status,
              v.SeatingCapacity,
              v.CurrentMileage,
              NVL(v.Category, 
                CASE 
                  WHEN v.DailyRate <= 50 THEN 'ECONOMY'
                  WHEN v.DailyRate > 50 AND v.DailyRate <= 100 THEN 'SUV'
                  ELSE 'LUXURY'
                END
              ) AS Category,
              pn.PlateNumber AS PLATENUMBER,
              c.Name AS Company,
              NVL(d.damage_count, 0) AS DamageCount,
              CASE 
                WHEN UPPER(v.Status) = 'MAINTENANCE' THEN 'Under Maintenance'
                WHEN UPPER(v.Status) = 'RESERVED' THEN 'Reserved'
                WHEN UPPER(v.Status) = 'AVAILABLE' THEN 'Available'
                ELSE 'Unavailable'
              END AS StatusLabel
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       LEFT JOIN (
         SELECT Vehicle_id, COUNT(*) AS damage_count
         FROM Damage_Report
         GROUP BY Vehicle_id
       ) d ON d.Vehicle_id = v.ID
       WHERE 1=1`;

    const queryParams = {};
    if (categoryLower !== 'all') {
       query += ` AND (v.Category = :categoryUpper OR (v.Category IS NULL AND ${rateCondition}))`;
       queryParams.categoryUpper = categoryLower.toUpperCase();
    }
    
    // Filter out unavailable unless requested
    if (!includeUnavailable || includeUnavailable === 'false') {
      query += ` AND UPPER(v.Status) IN ('AVAILABLE', 'MAINTENANCE', 'RESERVED')`;
    }
    
    query += ` ORDER BY v.DailyRate`;
    
    const result = await conn.execute(query, queryParams);
    res.json({ items: result.rows || [], category: categoryLower });
  } catch (err) {
    console.error('Category cars error:', err);
    // If Category column doesn't exist, try without it
    try {
      const conn = await getConnection();
      let rateCondition = '1=1';
      if (categoryLower === 'economy') {
        rateCondition = 'v.DailyRate <= 50';
      } else if (categoryLower === 'suv') {
        rateCondition = 'v.DailyRate > 50 AND v.DailyRate <= 100';
      } else if (categoryLower === 'luxury') {
        rateCondition = 'v.DailyRate > 100';
      }
      
      const fallbackQuery = `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              v.Status,
              v.SeatingCapacity,
              v.CurrentMileage,
              CASE 
                WHEN v.DailyRate <= 50 THEN 'ECONOMY'
                WHEN v.DailyRate > 50 AND v.DailyRate <= 100 THEN 'SUV'
                ELSE 'LUXURY'
              END AS Category,
              pn.PlateNumber AS PLATENUMBER,
              c.Name AS Company,
              NVL(d.damage_count, 0) AS DamageCount,
              CASE 
                WHEN UPPER(v.Status) = 'MAINTENANCE' THEN 'Under Maintenance'
                WHEN UPPER(v.Status) = 'RESERVED' THEN 'Reserved'
                WHEN UPPER(v.Status) = 'AVAILABLE' THEN 'Available'
                ELSE 'Unavailable'
              END AS StatusLabel
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       LEFT JOIN (
         SELECT Vehicle_id, COUNT(*) AS damage_count
         FROM Damage_Report
         GROUP BY Vehicle_id
       ) d ON d.Vehicle_id = v.ID
       WHERE ${rateCondition}
       ORDER BY v.DailyRate`;
      
      const result = await conn.execute(fallbackQuery);
      res.json({ items: result.rows || [], category: categoryLower });
    } catch (fallbackErr) {
      console.error('Fallback category query error:', fallbackErr);
      res.status(500).json({ error: 'Could not fetch cars by category', detail: fallbackErr.message });
    }
  }
});

// Get single car details (FEATURE 2 & 3)
app.get('/api/cars/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const conn = await getConnection();
    
    // Get car details
    const carResult = await conn.execute(
      `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              v.Status,
              v.SeatingCapacity,
              v.CurrentMileage,
              v.Category,
              v.LastServiceDate,
              pn.PlateNumber AS PLATENUMBER,
              pn.Model,
              pn.Year,
              c.Name AS Company,
              CASE 
                WHEN v.Status = 'MAINTENANCE' THEN 'Under Maintenance'
                WHEN v.Status = 'RESERVED' THEN 'Reserved'
                WHEN v.Status = 'AVAILABLE' THEN 'Available'
                ELSE 'Unavailable'
              END AS StatusLabel
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       WHERE v.ID = :id`,
      { id }
    );
    
    if (!carResult.rows || carResult.rows.length === 0) {
      return res.status(404).json({ error: 'Car not found' });
    }
    
    const car = carResult.rows[0];
    
    // Get maintenance history (MAINTENANCE TRANSPARENCY FEATURE)
    const maintenanceResult = await conn.execute(
      `SELECT MaintenanceDate, Description, Cost
       FROM Maintenance
       WHERE Vehicle_id = :id
       ORDER BY MaintenanceDate DESC
       FETCH FIRST 10 ROWS ONLY`,
      { id }
    );
    
    // Get damage history
    const damageResult = await conn.execute(
      `SELECT SeverityLevel, Description, EstimatedCost, ReportDate
       FROM Damage_Report
       WHERE Vehicle_id = :id
       ORDER BY ReportDate DESC
       FETCH FIRST 5 ROWS ONLY`,
      { id }
    );
    
    // Get upcoming reservations
    const reservationResult = await conn.execute(
      `SELECT Rent_StartDate, Rent_EndDate, Status
       FROM Reservation
       WHERE Vehicle_id = :id
         AND Status = 'RESERVED'
         AND Rent_StartDate >= SYSDATE
       ORDER BY Rent_StartDate
       FETCH FIRST 3 ROWS ONLY`,
      { id }
    );
    
    res.json({
      car: car,
      maintenanceHistory: maintenanceResult.rows || [],
      damageHistory: damageResult.rows || [],
      upcomingReservations: reservationResult.rows || []
    });
  } catch (err) {
    console.error('Car details error:', err);
    res.status(500).json({ error: 'Could not fetch car details', detail: err.message });
  }
});

// Create a booking (Reservation entry)
app.post('/api/bookings', requireAuth, async (req, res) => {
  const {
    vehicleId,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate,
    driverRequired
  } = req.body || {};

  if (!vehicleId || !pickupDate || !dropoffDate) {
    return res.status(400).json({ error: 'vehicleId, pickupDate and dropoffDate are required' });
  }

  try {
    const conn = await getConnection();

    // Get user's Customer ID
    const appUserId = req.user.sub;
    const appUserResult = await conn.execute(
      'SELECT Email, FullName, Phone FROM AppUser WHERE ID = :id',
      { id: appUserId }
    );
    
    if (!appUserResult.rows || appUserResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found. Please login again.' });
    }
    
    const appUser = appUserResult.rows[0];
    const customerId = await getCustomerIdFromAppUser(
      conn,
      appUserId,
      appUser.EMAIL,
      appUser.FULLNAME,
      appUser.PHONE
    );
    
    // Check if customer is blacklisted
    const customerCheck = await conn.execute(
      'SELECT BlackListStatus FROM Customer WHERE ID = :id',
      { id: customerId }
    );
    
    if (customerCheck.rows && customerCheck.rows.length > 0) {
      if (customerCheck.rows[0].BLACKLISTSTATUS === 'Y') {
        return res.status(403).json({ 
          error: 'Customer is blacklisted and cannot make reservations. Please contact customer service.' 
        });
      }
    }

    // Check if vehicle is free in the requested window
    const conflict = await conn.execute(
      `SELECT 1
       FROM Reservation r
       WHERE r.Vehicle_id = :vehicleId
         AND r.Status = 'RESERVED'
         AND NOT (
           r.Rent_EndDate < TO_DATE(:start, 'YYYY-MM-DD')
           OR r.Rent_StartDate > TO_DATE(:end, 'YYYY-MM-DD')
         )`,
      { vehicleId, start: pickupDate, end: dropoffDate }
    );

    if (conflict.rows && conflict.rows.length > 0) {
      // Get the conflicting reservation details for better error message
      const conflictDetails = await conn.execute(
        `SELECT TO_CHAR(Rent_StartDate, 'YYYY-MM-DD') AS StartDate, 
                TO_CHAR(Rent_EndDate, 'YYYY-MM-DD') AS EndDate
         FROM Reservation
         WHERE Vehicle_id = :vehicleId
           AND Status = 'RESERVED'
           AND NOT (
             Rent_EndDate < TO_DATE(:start, 'YYYY-MM-DD')
             OR Rent_StartDate > TO_DATE(:end, 'YYYY-MM-DD')
           )
         FETCH FIRST 1 ROWS ONLY`,
        { vehicleId, start: pickupDate, end: dropoffDate }
      );
      
      if (conflictDetails.rows && conflictDetails.rows.length > 0) {
        const conflict = conflictDetails.rows[0];
        return res.status(409).json({ 
          error: `Car already reserved for selected dates. The car is reserved from ${conflict.STARTDATE} to ${conflict.ENDDATE}. Please choose different dates.` 
        });
      }
      return res.status(409).json({ error: 'Car already reserved for selected dates' });
    }

    // Check vehicle status with detailed messages
    const vehicleResult = await conn.execute(
      `SELECT Status, DailyRate, Category, Description FROM Vehicle WHERE ID = :id`,
      { id: vehicleId }
    );
    
    if (!vehicleResult.rows || vehicleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    const vehicle = vehicleResult.rows[0];
    if (vehicle.STATUS === 'MAINTENANCE') {
      // Get maintenance details
      const maintResult = await conn.execute(
        `SELECT TO_CHAR(MAX(MaintenanceDate), 'YYYY-MM-DD') AS LastMaintenanceDate,
                MAX(Description) AS LastMaintenanceDesc
         FROM Maintenance
         WHERE Vehicle_id = :id`,
        { id: vehicleId }
      );
      const maint = maintResult.rows?.[0];
      const maintDate = maint?.LASTMAINTENANCEDATE ? new Date(maint.LASTMAINTENANCEDATE).toLocaleDateString() : 'recently';
      return res.status(409).json({ 
        error: `Car is under maintenance until further notice. Last maintenance: ${maintDate}. Please choose a different car.` 
      });
    }
    if (vehicle.STATUS === 'RESERVED') {
      return res.status(409).json({ error: 'Car is currently reserved. Please check back later or choose a different car.' });
    }
    if (vehicle.STATUS !== 'AVAILABLE') {
      return res.status(409).json({ error: `Car status is ${vehicle.STATUS}. This car cannot be booked at this time.` });
    }

    // Compute rate as DailyRate * number of days
    const dailyRate = vehicle.DAILYRATE || 0;
    const ms = new Date(dropoffDate) - new Date(pickupDate);
    const days = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    const totalRate = dailyRate * days;

    // Get a staff member (use first STAFF role)
    const staffResult = await conn.execute(
      `SELECT s.ID FROM Staff s
       JOIN Role r ON s.Role_id = r.ID
       WHERE r.Name = 'STAFF'
       FETCH FIRST 1 ROWS ONLY`
    );
    const staffId = staffResult.rows?.[0]?.ID || 1;

    // Insert reservation
    const insertResult = await conn.execute(
      `INSERT INTO Reservation (
          ID,
          Vehicle_id,
          Customer_id,
          Staff_id,
          DriverRequired,
          Driver_id,
          Rent_StartDate,
          Rent_EndDate,
          RateAtBooking,
          PriceBasis,
          Status,
          PaymentStatus
       )
       VALUES (
         seq_reservation.NEXTVAL,
         :vehicleId,
         :customerId,
         :staffId,
         :driverRequired,
         NULL,
         TO_DATE(:start, 'YYYY-MM-DD'),
         TO_DATE(:end, 'YYYY-MM-DD'),
         :rate,
         'DAILY',
         'RESERVED',
         'UNPAID'
       )`,
      {
        vehicleId,
        customerId,
        staffId,
        driverRequired: driverRequired ? 'Y' : 'N',
        start: pickupDate,
        end: dropoffDate,
        rate: totalRate
      }
    );

    // Get the inserted reservation ID
    const bookingResult = await conn.execute(
      `SELECT ID FROM Reservation 
       WHERE Vehicle_id = :vehicleId 
         AND Customer_id = :customerId
         AND Rent_StartDate = TO_DATE(:start, 'YYYY-MM-DD')
         AND Rent_EndDate = TO_DATE(:end, 'YYYY-MM-DD')
       ORDER BY ID DESC
       FETCH FIRST 1 ROWS ONLY`,
      { vehicleId, customerId, start: pickupDate, end: dropoffDate }
    );
    
    const bookingId = bookingResult.rows[0].ID;
    
    res.status(201).json({
      id: bookingId,
      vehicleId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      driverRequired: !!driverRequired,
      totalRate
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Could not create booking', detail: err.message });
  }
});

// Start server with pool
async function start() {
  try {
    await initPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING
    });
    app.listen(PORT, () => {
      console.log(`API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start API', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await closePool();
  process.exit(0);
});

start();
