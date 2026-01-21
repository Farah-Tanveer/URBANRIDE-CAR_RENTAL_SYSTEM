# URBANRIDE Car Rental System - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- Oracle 11g Database
- npm or yarn

## Database Setup

1. Run DDL scripts in order (Oracle SQL Developer or SQL*Plus):
   ```sql
   @backend/sql/DDL.sql
   @backend/sql/app_user.sql
   @backend/sql/D2.sql
   ```

2. Insert sample data:
   ```sql
   @backend/sql/DML.sql
   ```

Notes:
- Vehicle.Category is already defined in DDL.sql (no separate ALTER script required).
- If you previously ran older scripts, re-run DDL.sql to ensure the latest schema is applied.

## Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file (copy from `env.example`):
   ```bash
   copy env.example .env
   ```

4. Update `.env` with your Oracle database credentials:
   ```
   PORT=4000
   DB_USER=YOUR_USERNAME
   DB_PASSWORD=YOUR_PASSWORD
   DB_CONNECTION_STRING=localhost:1521/XEPDB1
   JWT_SECRET=your-secret-key-here
   ```

5. Start the backend server:
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

6. The application (Frontend + Backend) will be available at `http://localhost:4001` (or the PORT defined in .env).
   The backend serves the frontend files automatically.

## Car Images & Logo

- Car photos are located in the `Images/` folder.
- Since the backend serves the project root, images are accessible directly.

## Features Implemented

### ✅ Feature 1: Responsive & Mobile-First Design
- Optimized for mobile devices and desktops.
- Responsive grid layouts for car listings and details.
- Hamburger menu for mobile navigation.

### ✅ Feature 2: Car Details Page & Booking
- Navigate to `/car/:id` to see full car details.
- Large, responsive car images with proper aspect ratio.
- "Book This Car" flow leads to a successful booking and a "Thank You" confirmation page.

### ✅ Feature 3: Backend APIs & Database
- Full Oracle Database connection using `oracledb`.
- `GET /api/cars/category/:category` - Get cars by category
- `GET /api/cars/:id` - Get complete car details
- `POST /api/bookings` - Create a reservation (checked against availability)
- `GET /api/health` - Health check

### ✅ Feature 4: Enhanced Data
- 18 cars total (Economy, SUV, Luxury)
- Real-time availability checks against reservations.

- Realistic data with different companies and rates

### ✅ Feature 5: Improved Authentication
- Better error messages (email exists, password too short, etc.)
- Email format validation
- Phone number uniqueness check
- Clear login error messages

### ✅ Feature 6: Clear Status Messages
- Detailed error messages for booking failures
- Maintenance dates shown when car unavailable
- Reservation conflict details
- Blacklist status messages

### ✅ Feature 7: Maintenance Transparency (Unique Feature)
- Customers can view complete maintenance history
- Shows maintenance dates, descriptions, and costs
- Builds trust through transparency
- Available on car details page

### ✅ Feature 8: About Page
- Complete information about the system
- Category explanations
- Booking workflow guide
- Reliability features explained

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login user

### Cars
- `GET /api/cars/category/:category` - Get cars by category (economy, suv, luxury)
- `GET /api/cars/:id` - Get car details with maintenance history
- `GET /api/cars/available?start=YYYY-MM-DD&end=YYYY-MM-DD` - Available cars
- `GET /api/cars/reserved?start=YYYY-MM-DD&end=YYYY-MM-DD` - Reserved cars
- `GET /api/cars/maintenance` - Cars under maintenance
- `GET /api/cars/:id/damage-history` - Damage history for a car

### Bookings
- `POST /api/bookings` - Create booking (requires authentication)

## Troubleshooting

### Database Connection Issues
- Verify Oracle service is running
- Check connection string format: `host:port/service`
- Ensure user has proper permissions

### CORS Errors
- Make sure backend is running on port 4000
- Check `API_BASE` in frontend JavaScript files
- Backend has CORS enabled for all origins

### Static Assets Not Loading
- Serve the project root (`c:\Users\User\Desktop\DIGITAL_CAR_RENTAL_SYSTEM`) so `Images/` and `Logo.svg` are accessible via the browser.
- If opening HTML files directly from disk, some browsers block API calls or static assets due to CORS; use a local http server.

## Notes

- The system uses JWT tokens for authentication (2-hour expiry)
- All dates should be in YYYY-MM-DD format
- Vehicle statuses: AVAILABLE, RESERVED, MAINTENANCE, UNAVAILABLE
- Reservation statuses: RESERVED, CANCELLED, COMPLETED
