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

The API will be available at `http://localhost:4000`

## Frontend Setup

1. The frontend is static HTML/CSS/JS - no build step required.

2. Serve the project root so the Images folder and logo load correctly:
   ```bash
   # Using Node.js http-server (recommended)
   npx http-server -p 8000
   # Or Python if available
   python -m http.server 8000
   ```

3. Access the application:
   - Open `http://localhost:8000` in your browser

## Car Images & Logo

- Car photos are located in the `Images/` folder and are automatically displayed on the Cars and Car Details pages.
- Ensure you serve the project root (not just the `frontend` or `backend` subfolder) so `Images/` and `Logo.svg` are accessible.
- If some car images are missing, a placeholder is shown.

## Features Implemented

### ✅ Feature 1: Clickable Category Cards
- Category cards on homepage are clickable
- Navigate to `/cars/economy`, `/cars/suv`, or `/cars/luxury`
- Shows filtered cars by category

### ✅ Feature 2: Car Details Page
- Navigate to `/car/:id` to see full car details
- Shows all information including features, maintenance history

### ✅ Feature 3: Backend APIs
- `GET /api/cars/category/:category` - Get cars by category
- `GET /api/cars/:id` - Get complete car details
- Improved booking validation

### ✅ Feature 4: Enhanced DML Data
- 18 cars total (6 Economy, 6 SUV, 6 Luxury)
- Mix of AVAILABLE, RESERVED, and MAINTENANCE statuses
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
