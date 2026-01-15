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
-----------------------------------------------------------
INSERT ALL
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description)
    VALUES (1, 1, 12000, 'Red', SYSDATE-100, 2500, 'AVAILABLE', 5, 'Honda City')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description)
    VALUES (2, 2, 8000, 'White', SYSDATE-200, 3000, 'AVAILABLE', 5, 'Toyota Corolla')
    INTO Vehicle (ID, Company_id, CurrentMileage, Color, LastServiceDate, DailyRate, Status, SeatingCapacity, Description)
    VALUES (3, 3, 15000, 'Black', SYSDATE-150, 2700, 'UNAVAILABLE', 7, 'Hyundai Tucson')
SELECT * FROM dual;

-----------------------------------------------------------
-- 7. INSERT PLATE NUMBER
-----------------------------------------------------------
INSERT ALL
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year)
    VALUES ('LHR-1001', 1, 'Honda City', 2021)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year)
    VALUES ('LHR-1002', 2, 'Corolla', 2020)
    INTO PlateNumber (PlateNumber, Vehicle_id, Model, Year)
    VALUES ('LHR-1003', 3, 'Tucson', 2022)
SELECT * FROM dual;

-----------------------------------------------------------
-- 8. INSERT RESERVATION
-----------------------------------------------------------
INSERT ALL
    INTO Reservation (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired, Driver_id, Rent_StartDate, Rent_EndDate, RateAtBooking, PriceBasis, Status, PaymentStatus)
    VALUES (1, 1, 1, 3, 'N', NULL, SYSDATE-10, SYSDATE-7, 2500, 'DAILY', 'RESERVED', 'UNPAID')
    INTO Reservation (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired, Driver_id, Rent_StartDate, Rent_EndDate, RateAtBooking, PriceBasis, Status, PaymentStatus)
    VALUES (2, 2, 2, 3, 'Y', 1, SYSDATE-15, SYSDATE-12, 3000, 'DAILY', 'RESERVED', 'PAID')
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
    VALUES (1, 1, 2, SYSDATE-30, 'Oil Change', 1500)
    INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, Description, Cost)
    VALUES (2, 2, 2, SYSDATE-45, 'Engine Service', 3000)
SELECT * FROM dual;

-----------------------------------------------------------
-- 11. INSERT DAMAGE REPORT
-----------------------------------------------------------
INSERT ALL
    INTO Damage_Report (ID, Reservation_id, Vehicle_id, SeverityLevel, Description, EstimatedCost, ReportDate)
    VALUES (1, 1, 1, 'MEDIUM', 'Front bumper dent', 2000, SYSDATE-9)
    INTO Damage_Report (ID, Reservation_id, Vehicle_id, SeverityLevel, Description, EstimatedCost, ReportDate)
    VALUES (2, 2, 2, 'HIGH', 'Engine damage', 15000, SYSDATE-12)
SELECT * FROM dual;

COMMIT;
