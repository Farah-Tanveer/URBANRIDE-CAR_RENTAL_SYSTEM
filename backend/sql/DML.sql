-----------------------------------------------------------
-- 1. DELETE EXISTING DATA (to avoid FK issues)
-----------------------------------------------------------
DELETE FROM Damage_Report;
DELETE FROM Maintenance;
DELETE FROM Payment;
DELETE FROM Reservation;
DELETE FROM PlateNumber;
DELETE FROM Vehicle;
DELETE FROM Customer;
DELETE FROM Staff;
DELETE FROM Role;
DELETE FROM Company;

COMMIT;

-----------------------------------------------------------
-- 2. INSERT COMPANY
-----------------------------------------------------------
INSERT ALL
    INTO Company (ID, Name) VALUES (1, 'Honda')
    INTO Company (ID, Name) VALUES (2, 'Toyota')
    INTO Company (ID, Name) VALUES (3, 'Hyundai')
    INTO Company (ID, Name) VALUES (4, 'Kia Motors')
    INTO Company (ID, Name) VALUES (5, 'Suzuki')
    INTO Company (ID, Name) VALUES (6, 'BMW')
    INTO Company (ID, Name) VALUES (7, 'Mercedes-Benz')
    INTO Company (ID, Name) VALUES (8, 'Audi')
    INTO Company (ID, Name) VALUES (9, 'Nissan')
    INTO Company (ID, Name) VALUES (10, 'Ford')
SELECT * FROM dual;

-----------------------------------------------------------
-- 3. INSERT ROLE
-----------------------------------------------------------
INSERT ALL
    INTO Role (ID, Name, Description) VALUES (1, 'DRIVER', 'Assigned vehicle driving')
    INTO Role (ID, Name, Description) VALUES (2, 'MECHANIC', 'Vehicle maintenance staff')
    INTO Role (ID, Name, Description) VALUES (3, 'STAFF', 'Office staff')
SELECT * FROM dual;

-----------------------------------------------------------
-- 4. INSERT STAFF
-----------------------------------------------------------
INSERT ALL
    INTO Staff (ID, Role_id, FirstName, LastName, HireDate, ContactNo, Email, Salary, LicenseNo, ExperienceYears)
    VALUES (1, 1, 'Ali', 'Khan', SYSDATE-500, '03001234567', 'ali@mail.com', 45000, 'LIC001', 5)
    INTO Staff (ID, Role_id, FirstName, LastName, HireDate, ContactNo, Email, Salary, LicenseNo, ExperienceYears)
    VALUES (2, 2, 'Bilal', 'Raza', SYSDATE-400, '03011234567', 'bilal@mail.com', 50000, NULL, 3)
    INTO Staff (ID, Role_id, FirstName, LastName, HireDate, ContactNo, Email, Salary, LicenseNo, ExperienceYears)
    VALUES (3, 3, 'Sara', 'Iqbal', SYSDATE-300, '03021234567', 'sara@mail.com', 40000, NULL, 2)
SELECT * FROM dual;

-----------------------------------------------------------
-- 5. INSERT CUSTOMER
-----------------------------------------------------------
INSERT ALL
    INTO Customer (ID, FirstName, LastName, PhoneNumber, Email, Address, BlackListStatus)
    VALUES (1, 'Ahmed', 'Khan', '03111234567', 'ahmed@mail.com', 'Lahore', 'N')
    INTO Customer (ID, FirstName, LastName, PhoneNumber, Email, Address, BlackListStatus)
    VALUES (2, 'Fatima', 'Ali', '03121234567', 'fatima@mail.com', 'Karachi', 'N')
    INTO Customer (ID, FirstName, LastName, PhoneNumber, Email, Address, BlackListStatus)
    VALUES (3, 'Zara', 'Malik', '03131234567', 'zara@mail.com', 'Islamabad', 'Y')
SELECT * FROM dual;

-----------------------------------------------------------
-- 6. INSERT VEHICLE
-- Note: Category field must be added via ALTER_Vehicle_AddCategory.sql first
-----------------------------------------------------------

-- ECONOMY CARS (5+ cars)
INSERT ALL
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (1, 1, 12000, 'Red', SYSDATE-100, 40, 'AVAILABLE', 5, 'Honda City', 'ECONOMY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (2, 2, 8000, 'White', SYSDATE-200, 45, 'AVAILABLE', 5, 'Toyota Corolla', 'ECONOMY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (3, 5, 15000, 'Silver', SYSDATE-50, 35, 'AVAILABLE', 5, 'Suzuki Swift', 'ECONOMY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (4, 9, 20000, 'Blue', SYSDATE-30, 42, 'AVAILABLE', 5, 'Nissan Sunny', 'ECONOMY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (5, 10, 18000, 'Black', SYSDATE-80, 38, 'UNAVAILABLE', 5, 'Ford Fiesta', 'ECONOMY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (6, 3, 22000, 'Grey', SYSDATE-120, 40, 'MAINTENANCE', 5, 'Hyundai Accent', 'ECONOMY')
    SELECT * FROM dual;

-- SUV CARS (5+ cars)
INSERT ALL
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (7, 3, 15000, 'Black', SYSDATE-150, 80, 'AVAILABLE', 7, 'Hyundai Tucson', 'SUV')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (8, 2, 12000, 'White', SYSDATE-90, 85, 'AVAILABLE', 7, 'Toyota RAV4', 'SUV')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (9, 4, 18000, 'Silver', SYSDATE-60, 75, 'AVAILABLE', 7, 'Kia Sportage', 'SUV')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (10, 9, 14000, 'Blue', SYSDATE-40, 82, 'UNAVAILABLE', 7, 'Nissan X-Trail', 'SUV')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (11, 10, 16000, 'Red', SYSDATE-70, 78, 'AVAILABLE', 7, 'Ford Escape', 'SUV')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (12, 1, 19000, 'Grey', SYSDATE-110, 80, 'MAINTENANCE', 7, 'Honda CR-V', 'SUV')
    SELECT * FROM dual;

-- LUXURY CARS (5+ cars)
INSERT ALL
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (13, 6, 8000, 'Black', SYSDATE-20, 150, 'AVAILABLE', 5, 'BMW 3 Series', 'LUXURY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (14, 7, 6000, 'Silver', SYSDATE-10, 180, 'AVAILABLE', 5, 'Mercedes-Benz C-Class', 'LUXURY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (15, 8, 5000, 'White', SYSDATE-5, 170, 'AVAILABLE', 5, 'Audi A4', 'LUXURY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (16, 6, 12000, 'Blue', SYSDATE-25, 200, 'UNAVAILABLE', 5, 'BMW 5 Series', 'LUXURY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (17, 7, 9000, 'Black', SYSDATE-15, 190, 'AVAILABLE', 5, 'Mercedes-Benz E-Class', 'LUXURY')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description, Category)
    VALUES (18, 8, 7000, 'Grey', SYSDATE-8, 175, 'MAINTENANCE', 5, 'Audi A6', 'LUXURY')
SELECT * FROM dual;

-----------------------------------------------------------
-- 7. INSERT PLATE NUMBER
-----------------------------------------------------------
INSERT ALL
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1001', 1, 'Honda City', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1002', 2, 'Corolla', 2020)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1003', 3, 'Swift', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1004', 4, 'Sunny', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1005', 5, 'Fiesta', 2020)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-1006', 6, 'Accent', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2001', 7, 'Tucson', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2002', 8, 'RAV4', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2003', 9, 'Sportage', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2004', 10, 'X-Trail', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2005', 11, 'Escape', 2020)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-2006', 12, 'CR-V', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3001', 13, '3 Series', 2023)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3002', 14, 'C-Class', 2023)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3003', 15, 'A4', 2023)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3004', 16, '5 Series', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3005', 17, 'E-Class', 2022)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year) VALUES ('LHR-3006', 18, 'A6', 2022)
SELECT * FROM dual;

-----------------------------------------------------------
-- 8. INSERT RESERVATION
-----------------------------------------------------------
INSERT ALL
    INTO Reservation (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired, Driver_id, Rent_StartDate, Rent_EndDate, RateAtBooking, PriceBasis, Status, PaymentStatus)
    VALUES (1, 5, 1, 3, 'N', NULL, SYSDATE+2, SYSDATE+5, 38, 'DAILY', 'RESERVED', 'UNPAID')
    INTO Reservation (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired, Driver_id, Rent_StartDate, Rent_EndDate, RateAtBooking, PriceBasis, Status, PaymentStatus)
    VALUES (2, 10, 2, 3, 'Y', 1, SYSDATE+1, SYSDATE+4, 82, 'DAILY', 'RESERVED', 'PAID')
    INTO Reservation (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired, Driver_id, Rent_StartDate, Rent_EndDate, RateAtBooking, PriceBasis, Status, PaymentStatus)
    VALUES (3, 16, 1, 3, 'N', NULL, SYSDATE+3, SYSDATE+7, 200, 'DAILY', 'RESERVED', 'PARTIALLY PAID')
SELECT * FROM dual;

-----------------------------------------------------------
-- 9. INSERT PAYMENT
-----------------------------------------------------------
INSERT ALL
    INTO Payment (ID, Reservation_id, Customer_id, PaymentDate, Amount, PaymentMethod)
    VALUES (1, 2, 2, SYSDATE-12, 3000, 'CASH')
    INTO Payment (ID, Reservation_id, Customer_id, PaymentDate, Amount, PaymentMethod)
    VALUES (2, 1, 1, SYSDATE-8, 1000, 'CARD')
SELECT * FROM dual;

-----------------------------------------------------------
-- 10. INSERT MAINTENANCE
-----------------------------------------------------------
INSERT ALL
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (1, 1, 2, SYSDATE-30, 'Oil Change and Filter Replacement', 1500)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (2, 2, 2, SYSDATE-45, 'Engine Service and Tune-up', 3000)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (3, 6, 2, SYSDATE-5, 'Brake System Inspection and Repair', 5000)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (4, 12, 2, SYSDATE-3, 'Transmission Service', 8000)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (5, 18, 2, SYSDATE-2, 'Suspension and Alignment Check', 6000)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (6, 7, 2, SYSDATE-60, 'Regular Service', 2500)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (7, 13, 2, SYSDATE-20, 'Premium Service Package', 12000)
SELECT * FROM dual;

-----------------------------------------------------------
-- 11. INSERT DAMAGE REPORT
-----------------------------------------------------------
INSERT ALL
    INTO Damage_Report (ID, Reservation_id, Vehicle_id, SeverityLevel, Description, EstimatedCost, ReportDate)
    VALUES (1, 1, 5, 'LOW', 'Minor scratch on rear bumper', 1500, SYSDATE-8)
    INTO Damage_Report (ID, Reservation_id, Vehicle_id, SeverityLevel, Description, EstimatedCost, ReportDate)
    VALUES (2, 2, 10, 'MEDIUM', 'Side mirror damage', 3000, SYSDATE-5)
SELECT * FROM dual;

COMMIT;
