# 🚗 UrbanRide - Digital Car Rental System

A premium, full-stack car rental management system built with **Node.js**, **Oracle Database 11g**, and a modern **Vanilla JavaScript** frontend.

## 🚀 Tech Stack

- **Frontend:**
  - HTML5, CSS3 (Modern Flexbox/Grid, Animations)
  - Vanilla JavaScript (ES6+)
  - Custom Single Page Application (SPA) Router
  - Responsive Design (Mobile-First)

- **Backend:**
  - Node.js & Express.js
  - RESTful API Architecture
  - JWT Authentication (JSON Web Tokens)
  - Oracle Thick Client (node-oracledb)

- **Database:**
  - **Oracle Database 11g Express Edition (XE)**
  - Relational Schema (3NF)
  - PL/SQL Triggers & Sequences
  - Complex SQL Queries for Availability & Reporting

## ✨ Key Features

### 👤 User Portal
- **Browse Fleet:** Filter cars by category (Economy, SUV, Luxury).
- **Real-Time Availability:** System checks `Reservation` and `Maintenance` tables to show only truly available cars.
- **Smart Booking:** Prevents double-booking and validates date ranges.
- **Damage History:** View reported damage history for transparency before booking.
- **Blacklist Check:** Automatically blocks blacklisted customers from making reservations.

### 🛡️ Admin Dashboard
- **Role-Based Access:** Secure login for Admins.
- **Fleet Management:** Add new vehicles to the system (Company, Model, Rate, etc.).
- **System Overview:** (Extensible) View all active bookings and fleet status.

### 🔧 Backend Reliability
- **Direct API Calls:** A streamlined Node.js architecture processes requests efficiently.
- **Data Integrity:** Strict SQL constraints and triggers ensure booking overlaps are impossible.

## 🛠️ Setup & Installation

### Prerequisites
- Node.js (v14+)
- Oracle Database 11g (Running locally)
- Oracle Instant Client (if needed for Thick Mode)

### 1. Database Setup
Ensure your Oracle 11g instance is running. The system uses the following credentials by default (configure in `backend/.env`):
- **User:** `MEENA`
- **Password:** `meena`
- **Connection:** `localhost:1521/xe`

### 2. Run Application
The backend serves the frontend files automatically.

```bash
cd backend
npm install
npm start
```
*Access App at: http://localhost:4001*

## 🔑 Demo Credentials

Use these credentials to test the different roles:

| Role | Email | Password | Features |
|------|-------|----------|----------|
| **Admin** | `admin@urbanride.com` | `admin123` | Add Cars, Manage Fleet |
| **User** | `john@urbanride.com` | `123456` | Book Cars, View History |

## 🧪 Testing
To verify the system components:
```bash
npm test
```

## 📂 Project Structure
- `/backend`: API server and SQL scripts.
- `/backend/sql`: DDL and DML scripts for database schema.
- `/index.html`: Main entry point.
- `/script.js` & `/router.js`: Frontend logic and routing.
