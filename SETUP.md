# URBANRIDE Car Rental System - Setup Guide

## Prerequisites
- Node.js (v14 or higher)
- Oracle 11g Database
- npm or yarn

## Database Setup

1. **Run DDL Scripts** (in order):
   ```sql
   -- Run these in Oracle SQL Developer or SQL*Plus
   @backend/sql/DDL.sql
   @backend/sql/D2.sql
   @backend/sql/app_user.sql
   ```

2. **Add Category Field** (NEW):
   ```sql
   @backend/sql/ALTER_Vehicle_AddCategory.sql
   ```

3. **Insert Data**:
   ```sql
   @backend/sql/DML.sql
   ```

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
   cp env.example .env
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

1. The frontend is static HTML/CSS/JS - no build step required!

2. **Option 1: Simple HTTP Server** (recommended for development):
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server -p 8000
   ```

3. **Option 2: Open directly** (may have CORS issues):
   - Just open `index.html` in your browser
   - Note: API calls may fail due to CORS

4. Access the application:
   - Open `http://localhost:8000` in your browser

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

### Category Field Error
- Make sure you ran `ALTER_Vehicle_AddCategory.sql` before `DML.sql`
- If Category column doesn't exist, the category API will fail

## Notes

- The system uses JWT tokens for authentication (2-hour expiry)
- All dates should be in YYYY-MM-DD format
- Vehicle statuses: AVAILABLE, RESERVED, MAINTENANCE, UNAVAILABLE
- Reservation statuses: RESERVED, CANCELLED, COMPLETED
