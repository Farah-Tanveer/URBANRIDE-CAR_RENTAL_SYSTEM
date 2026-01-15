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

// Auth: sign up
app.post('/api/auth/signup', async (req, res) => {
  const { fullName, email, password, phone } = req.body || {};
  if (!fullName || !email || !password) {
    return res.status(400).json({ error: 'fullName, email, and password are required' });
  }
  try {
    const conn = await getConnection();
    const existing = await conn.execute(
      'SELECT ID FROM AppUser WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    if (existing.rows && existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await conn.execute(
      `INSERT INTO AppUser (ID, FullName, Email, PasswordHash, Phone)
       VALUES (appuser_seq.NEXTVAL, :fullName, :email, :passwordHash, :phone)
       RETURNING ID INTO :id`,
      {
        fullName,
        email,
        passwordHash,
        phone,
        id: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const userId = result.outBinds.id[0];
    const token = jwt.sign({ sub: userId, email }, JWT_SECRET, { expiresIn: '2h' });
    res.status(201).json({ token, user: { id: userId, fullName, email, phone } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Signup failed', detail: err.message });
  }
});

// Auth: login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      'SELECT ID, FullName, Email, PasswordHash, Phone FROM AppUser WHERE LOWER(Email) = LOWER(:email)',
      { email }
    );
    const user = result.rows?.[0];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.PASSWORDHASH);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ sub: user.ID, email: user.EMAIL }, JWT_SECRET, { expiresIn: '2h' });
    res.json({
      token,
      user: {
        id: user.ID,
        fullName: user.FULLNAME,
        email: user.EMAIL,
        phone: user.PHONE
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
              pn.PlateNumber,
              c.Name AS Company,
              CASE WHEN m.ID IS NOT NULL THEN 1 ELSE 0 END AS HasMaintenance,
              NVL(d.damage_count, 0) AS DamageCount
       FROM Vehicle v
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       LEFT JOIN Company c ON c.ID = v.Company_id
       LEFT JOIN Maintenance m ON m.Vehicle_id = v.ID
       LEFT JOIN (
         SELECT Vehicle_id, COUNT(*) AS damage_count
         FROM Damage_Report
         GROUP BY Vehicle_id
       ) d ON d.Vehicle_id = v.ID
       WHERE v.Status = 'Available'
         AND v.ID NOT IN (
           SELECT r.Vehicle_id
           FROM Reservation r
           WHERE r.Status = 'Reserved'
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

// Cars with maintenance records
app.get('/api/cars/maintenance', async (_req, res) => {
  try {
    const conn = await getConnection();
    const result = await conn.execute(
      `SELECT v.ID,
              v.Description,
              v.Color,
              v.DailyRate,
              pn.PlateNumber,
              m.MaintenanceDate,
              m.Description AS MaintenanceDescription,
              m.Cost
       FROM Maintenance m
       JOIN Vehicle v ON v.ID = m.Vehicle_id
       LEFT JOIN PlateNumber pn ON pn.Vehicle_id = v.ID
       ORDER BY m.MaintenanceDate DESC`
    );
    res.json({ items: result.rows || [] });
  } catch (err) {
    console.error('Maintenance cars error:', err);
    res.status(500).json({ error: 'Could not fetch maintenance cars', detail: err.message });
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

    // Check if vehicle is free in the requested window
    const conflict = await conn.execute(
      `SELECT 1
       FROM Reservation r
       WHERE r.Vehicle_id = :vehicleId
         AND r.Status = 'Reserved'
         AND NOT (
           r.Rent_EndDate < TO_DATE(:start, 'YYYY-MM-DD')
           OR r.Rent_StartDate > TO_DATE(:end, 'YYYY-MM-DD')
         )`,
      { vehicleId, start: pickupDate, end: dropoffDate }
    );

    if (conflict.rows && conflict.rows.length > 0) {
      return res.status(409).json({ error: 'Vehicle is already reserved in that period' });
    }

    // Compute rate as DailyRate * number of days
    const rateResult = await conn.execute(
      `SELECT DailyRate FROM Vehicle WHERE ID = :id`,
      { id: vehicleId }
    );
    const dailyRate = rateResult.rows?.[0]?.DAILYRATE || 0;
    const ms = new Date(dropoffDate) - new Date(pickupDate);
    const days = Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
    const totalRate = dailyRate * days;

    const result = await conn.execute(
      `INSERT INTO Reservation (
          ID,
          Vehicle_id,
          Customer_id,
          Staff_id,
          DriverRequired,
          Driver_id,
          Rent_StartDate,
          Rent_EndDate,
          RateNoBooking,
          PriceBasis,
          Status,
          PaymentStatus
       )
       VALUES (
         (SELECT NVL(MAX(ID),0) + 1 FROM Reservation),
         :vehicleId,
         1,
         1,
         :driverRequired,
         NULL,
         TO_DATE(:start, 'YYYY-MM-DD'),
         TO_DATE(:end, 'YYYY-MM-DD'),
         :rate,
         'Daily',
         'Reserved',
         'UNPAID'
       )
       RETURNING ID INTO :newId`,
      {
        vehicleId,
        driverRequired: driverRequired ? 'Y' : 'N',
        start: pickupDate,
        end: dropoffDate,
        rate: totalRate,
        newId: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
      }
    );

    const bookingId = result.outBinds.newId[0];
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
