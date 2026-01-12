-----------------------------------------------------------
-- DML SQL FILE  
-- INSERTING SAMPLE DATA FOR CAR RENTAL MANAGEMENT SYSTEM
-----------------------------------------------------------


-----------------------------------------------------------
-- 1. COMPANY DATA
-----------------------------------------------------------
INSERT ALL
INTO Company VALUES (1, 'Honda')
INTO Company VALUES (2, 'Toyota')
INTO Company VALUES (3, 'Hyundai')
INTO Company VALUES (4, 'Kia Motors')
INTO Company VALUES (5, 'Suzuki')
INTO Company VALUES (6, 'Audi')
INTO Company VALUES (7, 'BMW')
INTO Company VALUES (8, 'Mercedes')
INTO Company VALUES (9, 'Nissan')
INTO Company VALUES (10, 'Ford')
SELECT * FROM dual;




-----------------------------------------------------------
-- 2. VEHICLE DATA
-----------------------------------------------------------
INSERT ALL
INTO Vehicle VALUES (1, 1, 12000, 'Red', SYSDATE-100, 2500, 'Available', 5, 'Active', 'Honda City 1.5')
INTO Vehicle VALUES (2, 2, 8000,  'White', SYSDATE-200, 3000, 'Available', 5, 'Active', 'Toyota Corolla')
INTO Vehicle VALUES (3, 3, 15000, 'Black', SYSDATE-150, 2700, 'Unavailable', 7, 'Active', 'Hyundai Tucson')
INTO Vehicle VALUES (4, 4, 22000, 'Blue', SYSDATE-90, 3500, 'Available', 5, 'Active', 'Kia Sportage')
INTO Vehicle VALUES (5, 5, 5000,  'Grey', SYSDATE-60, 1500, 'Available', 4, 'Active', 'Suzuki Alto')
INTO Vehicle VALUES (6, 6, 18000, 'Black', SYSDATE-80, 6000, 'Available', 5, 'Active', 'Audi A4')
INTO Vehicle VALUES (7, 7, 25000, 'White', SYSDATE-120, 6500, 'Available', 5, 'Active', 'BMW 3 Series')
INTO Vehicle VALUES (8, 8, 30000, 'Silver', SYSDATE-50, 7000, 'Available', 5, 'Active', 'Mercedes C Class')
INTO Vehicle VALUES (9, 9, 14000, 'Green', SYSDATE-140, 2000, 'Available', 4, 'Active', 'Nissan Note')
INTO Vehicle VALUES (10, 10, 9000, 'Red', SYSDATE-110, 2800, 'Available', 5, 'Active', 'Ford Focus')
SELECT * FROM dual;




-----------------------------------------------------------
-- 3. PLATE NUMBER DATA
-----------------------------------------------------------
INSERT ALL
INTO PlateNumber VALUES ('LHR-1001', 1, 'Honda City', 2021)
INTO PlateNumber VALUES ('LHR-1002', 2, 'Corolla', 2020)
INTO PlateNumber VALUES ('LHR-1003', 3, 'Tucson', 2022)
INTO PlateNumber VALUES ('LHR-1004', 4, 'Sportage', 2021)
INTO PlateNumber VALUES ('LHR-1005', 5, 'Alto', 2023)
INTO PlateNumber VALUES ('LHR-1006', 6, 'Audi A4', 2019)
INTO PlateNumber VALUES ('LHR-1007', 7, 'BMW 3 Series', 2018)
INTO PlateNumber VALUES ('LHR-1008', 8, 'Mercedes C', 2019)
INTO PlateNumber VALUES ('LHR-1009', 9, 'Nissan Note', 2020)
INTO PlateNumber VALUES ('LHR-1010', 10, 'Ford Focus', 2022)
SELECT * FROM dual;



-----------------------------------------------------------
-- 4. ROLE DATA
-----------------------------------------------------------
INSERT ALL
INTO Role VALUES (1, 'DRIVER', 'Handles driving tasks')
INTO Role VALUES (2, 'MECHANIC', 'Responsible for repairs')
INTO Role VALUES (3, 'OTHER STAFF', 'Support staff')
INTO Role VALUES (4, 'DRIVER', 'Senior Driver')
INTO Role VALUES (5, 'MECHANIC', 'Junior Technician')
INTO Role VALUES (6, 'OTHER STAFF', 'Receptionist')
INTO Role VALUES (7, 'DRIVER', 'VIP Driver')
INTO Role VALUES (8, 'MECHANIC', 'Engine Specialist')
INTO Role VALUES (9, 'OTHER STAFF', 'Clerk')
INTO Role VALUES (10, 'DRIVER', 'Long Route Driver')
SELECT * FROM dual;




-----------------------------------------------------------
-- 5. STAFF DATA
-----------------------------------------------------------

INSERT ALL
INTO Staff VALUES (1, 1, 'Ali', 'Khan', SYSDATE-500, '03001234567', 'ali1@mail.com', 45000, 'LIC001', 5)
INTO Staff VALUES (2, 2, 'Bilal', 'Raza', SYSDATE-400, '03011234567', 'bilal@mail.com', 50000, NULL, 3)
INTO Staff VALUES (3, 3, 'Ayesha', 'Malik', SYSDATE-300, '03021234567', 'ayesha@mail.com', 40000, NULL, 2)
INTO Staff VALUES (4, 1, 'Hamza', 'Javed', SYSDATE-250, '03031234567', 'hamza@mail.com', 47000, 'LIC002', 4)
INTO Staff VALUES (5, 2, 'Farhan', 'Ali', SYSDATE-200, '03041234567', 'farhan@mail.com', 52000, NULL, 6)
INTO Staff VALUES (6, 3, 'Sara', 'Iqbal', SYSDATE-180, '03051234567', 'sara@mail.com', 38000, NULL, 1)
INTO Staff VALUES (7, 1, 'Usman', 'Khan', SYSDATE-160, '03061234567', 'usman@mail.com', 46000, 'LIC003', 3)
INTO Staff VALUES (8, 2, 'Danish', 'Akram', SYSDATE-150, '03071234567', 'danish@mail.com', 54000, NULL, 7)
INTO Staff VALUES (9, 3, 'Hina', 'Riaz', SYSDATE-100, '03081234567', 'hina@mail.com', 39000, NULL, 2)
INTO Staff VALUES (10, 1, 'Zain', 'Shah', SYSDATE-80, '03091234567', 'zain@mail.com', 48000, 'LIC004', 4)
SELECT * FROM dual;


-----------------------------------------------------------
-- 6. CUSTOMER DATA
-----------------------------------------------------------
INSERT ALL
INTO Customer VALUES (1, 'Ahmed', 'Khan', '03111234567', 'ahmed@mail.com', 'Lahore', 'N')
INTO Customer VALUES (2, 'Fatima', 'Ali', '03121234567', 'fatima@mail.com', 'Karachi', 'N')
INTO Customer VALUES (3, 'Saad', 'Raza', '03131234567', 'saad@mail.com', 'Islamabad', 'N')
INTO Customer VALUES (4, 'Sana', 'Malik', '03141234567', 'sana@mail.com', 'Multan', 'N')
INTO Customer VALUES (5, 'Hassan', 'Shah', '03151234567', 'hassan@mail.com', 'Peshawar', 'N')
INTO Customer VALUES (6, 'Mina', 'Iqbal', '03161234567', 'mina@mail.com', 'Lahore', 'N')
INTO Customer VALUES (7, 'Imran', 'Qureshi', '03171234567', 'imran@mail.com', 'Karachi', 'N')
INTO Customer VALUES (8, 'Zara', 'Ahmed', '03181234567', 'zara@mail.com', 'Islamabad', 'Y')
INTO Customer VALUES (9, 'Talha', 'Rafiq', '03191234567', 'talha@mail.com', 'Rawalpindi', 'N')
INTO Customer VALUES (10, 'Nida', 'Yousaf', '03201234567', 'nida@mail.com', 'Sialkot', 'N')
SELECT * FROM dual;




-----------------------------------------------------------
-- 7. RESERVATION DATA
-----------------------------------------------------------
INSERT ALL
INTO Reservation VALUES (1, 1, 1, 1, 'N', NULL, SYSDATE-15, SYSDATE-12, 2500, 'Daily', 'Reserved', 'UNPAID')
INTO Reservation VALUES (2, 2, 2, 2, 'Y', 1, SYSDATE-20, SYSDATE-16, 3000, 'Daily', 'Reserved', 'PAID')
INTO Reservation VALUES (3, 3, 3, 3, 'N', NULL, SYSDATE-30, SYSDATE-26, 2700, 'Daily', 'Canceled', 'UNPAID')
INTO Reservation VALUES (4, 4, 4, 4, 'Y', 4, SYSDATE-10, SYSDATE-7, 3500, 'Daily', 'Reserved', 'PARTIALLY PAID')
INTO Reservation VALUES (5, 5, 5, 5, 'N', NULL, SYSDATE-18, SYSDATE-14, 1500, 'Daily', 'Free', 'UNPAID')
INTO Reservation VALUES (6, 6, 6, 6, 'N', NULL, SYSDATE-22, SYSDATE-19, 6000, 'Daily', 'Reserved', 'PAID')
INTO Reservation VALUES (7, 7, 7, 7, 'Y', 7, SYSDATE-14, SYSDATE-11, 6500, 'Daily', 'Reserved', 'UNPAID')
INTO Reservation VALUES (8, 8, 8, 8, 'N', NULL, SYSDATE-25, SYSDATE-22, 7000, 'Daily', 'Canceled', 'UNPAID')
INTO Reservation VALUES (9, 9, 9, 9, 'Y', 9, SYSDATE-8, SYSDATE-4, 2000, 'Daily', 'Reserved', 'PAID')
INTO Reservation VALUES (10, 10, 10, 10, 'N', NULL, SYSDATE-6, SYSDATE-3, 2800, 'Daily', 'Reserved', 'PARTIALLY PAID')
SELECT * FROM dual;




-----------------------------------------------------------
-- 8. PAYMENT DATA
-----------------------------------------------------------
INSERT ALL
INTO Payment VALUES (1, 2, 2, SYSDATE-15, 3000, 'CASH')
INTO Payment VALUES (2, 4, 4, SYSDATE-8, 2000, 'CREDITCARD')
INTO Payment VALUES (3, 6, 6, SYSDATE-18, 6000, 'ONLINE TRANSACTION')
INTO Payment VALUES (4, 7, 7, SYSDATE-10, 3000, 'CASH')
INTO Payment VALUES (5, 9, 9, SYSDATE-3, 2000, 'CARD')
INTO Payment VALUES (6, 10, 10, SYSDATE-2, 1500, 'CASH')
INTO Payment VALUES (7, 1, 1, SYSDATE-11, 1000, 'CASH')
INTO Payment VALUES (8, 3, 3, SYSDATE-25, 500, 'CARD')
INTO Payment VALUES (9, 5, 5, SYSDATE-12, 1500, 'CREDITCARD')
INTO Payment VALUES (10, 8, 8, SYSDATE-21, 3000, 'ONLINE TRANSACTION')
SELECT * FROM dual;




-----------------------------------------------------------
-- 9. MAINTENANCE DATA
-----------------------------------------------------------
INSERT ALL
INTO Maintenance VALUES (1, 1, 2, SYSDATE-60, 'Oil change', 500)
INTO Maintenance VALUES (2, 2, 5, SYSDATE-90, 'Engine tuning', 1500)
INTO Maintenance VALUES (3, 3, 8, SYSDATE-40, 'Brake repair', 2200)
INTO Maintenance VALUES (4, 4, 3, SYSDATE-75, 'Filter replacement', 600)
INTO Maintenance VALUES (5, 5, 6, SYSDATE-30, 'Tyre change', 3000)
INTO Maintenance VALUES (6, 6, 7, SYSDATE-55, 'AC service', 1800)
INTO Maintenance VALUES (7, 7, 2, SYSDATE-45, 'Alignment service', 900)
INTO Maintenance VALUES (8, 8, 4, SYSDATE-50, 'Battery replacement', 7000)
INTO Maintenance VALUES (9, 9, 8, SYSDATE-25, 'Suspension check', 1100)
INTO Maintenance VALUES (10, 10, 1, SYSDATE-10, 'General inspection', 500)
SELECT * FROM dual;




-----------------------------------------------------------
-- 10. DAMAGE REPORT DATA
-----------------------------------------------------------
INSERT ALL
INTO Damage_Report VALUES (1, 1, 1, 'Low', 'Scratch on left door', 1000, SYSDATE-9)
INTO Damage_Report VALUES (2, 2, 2, 'Medium', 'Minor dent on bumper', 2000, SYSDATE-18)
INTO Damage_Report VALUES (3, 3, 3, 'High', 'Front bumper broken', 15000, SYSDATE-28)
INTO Damage_Report VALUES (4, 4, 4, 'Low', 'Mirror cracked', 1200, SYSDATE-11)
INTO Damage_Report VALUES (5, 5, 5, 'Low', 'Tyre damage', 800, SYSDATE-14)
INTO Damage_Report VALUES (6, 6, 6, 'Medium', 'Headlight broken', 5000, SYSDATE-21)
INTO Damage_Report VALUES (7, 7, 7, 'High', 'Engine overheating damage', 30000, SYSDATE-13)
INTO Damage_Report VALUES (8, 8, 8, 'Low', 'Rear light cracked', 1500, SYSDATE-24)
INTO Damage_Report VALUES (9, 9, 9, 'Medium', 'Side door dent', 2500, SYSDATE-4)
INTO Damage_Report VALUES (10, 10, 10, 'Low', 'Paint faded', 500, SYSDATE-6)
SELECT * FROM dual;




