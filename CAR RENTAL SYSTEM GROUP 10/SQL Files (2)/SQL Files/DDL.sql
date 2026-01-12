-----------------------------------------------------------
-- DDL SQL FILE  
-- TABLE CREATION FOR CAR RENTAL MANAGEMENT SYSTEM
-----------------------------------------------------------


-----------------------------------------------------------
-- 1. COMPANY TABLE
-----------------------------------------------------------
CREATE TABLE Company (
    ID NUMBER(10) PRIMARY KEY,
    Name VARCHAR2(150) NOT NULL UNIQUE
);



-----------------------------------------------------------
-- 2. VEHICLE TABLE
-----------------------------------------------------------
CREATE TABLE Vehicle (
    ID NUMBER(10) PRIMARY KEY,
    Company_id NUMBER(10) NOT NULL,
    CurrentMileage NUMBER DEFAULT 0 NOT NULL,
    Color VARCHAR2(20),
    LastServiceDate DATE,
    DailyRate NUMBER(8,2) NOT NULL,
    Status  VARCHAR2(35) DEFAULT 'Active'
     CHECK(Status IN('Available' , 'Unavailable')),  
    SeatingCapacity NUMBER(2) NOT NULL,
    Description VARCHAR2(200),  
    CONSTRAINT fk_vehicle_company 
        FOREIGN KEY (Company_id) REFERENCES Company(ID)
);



-----------------------------------------------------------
-- 3. PLATE NUMBER TABLE
-----------------------------------------------------------
CREATE TABLE PlateNumber (
    PlateNumber VARCHAR2(20) PRIMARY KEY,
    Vehicle_id NUMBER(10) NOT NULL UNIQUE,
    Model VARCHAR2(150) NOT NULL,
    Year NUMBER(4) NOT NULL,

    CONSTRAINT fk_plate_vehicle 
        FOREIGN KEY (Vehicle_id) REFERENCES Vehicle(ID)
);



-----------------------------------------------------------
-- 4. ROLE TABLE
-----------------------------------------------------------
CREATE TABLE Role (
    ID NUMBER(10) PRIMARY KEY,
    Name VARCHAR2(20) NOT NULL 
        CHECK (Name IN ('DRIVER','MECHANIC','OTHER STAFF')),
    Description VARCHAR2(200)
);



-----------------------------------------------------------
-- 5. STAFF TABLE
-----------------------------------------------------------
CREATE TABLE Staff (
    ID NUMBER(10) PRIMARY KEY,
    Role_id NUMBER(10) NOT NULL,
    FirstName VARCHAR2(50) NOT NULL,
    LastName VARCHAR2(50) NOT NULL,
    HireDate DATE NOT NULL,
    ContactNo VARCHAR2(20),
    Email VARCHAR2(100) NOT NULL UNIQUE,
    Salary NUMBER(10,2) NOT NULL,
    LicenseNo VARCHAR2(50) UNIQUE,
    ExperienceYears NUMBER(2) NOT NULL,

    CONSTRAINT fk_staff_role 
        FOREIGN KEY (Role_id) REFERENCES Role(ID)
);



-----------------------------------------------------------
-- 6. CUSTOMER TABLE
-----------------------------------------------------------
CREATE TABLE Customer (
    ID NUMBER(10) PRIMARY KEY,
    FirstName VARCHAR2(50) NOT NULL,
    LastName VARCHAR2(50) NOT NULL,
    PhoneNumber VARCHAR2(20) NOT NULL,
    Email VARCHAR2(100) NOT NULL UNIQUE,
    Address VARCHAR2(200),
    BlackListStatus CHAR(1) DEFAULT 'N' 
        CHECK (BlackListStatus IN ('Y','N'))
);



-----------------------------------------------------------
-- 7. RESERVATION TABLE
-----------------------------------------------------------
CREATE TABLE Reservation (
    ID NUMBER(10) PRIMARY KEY,
    Vehicle_id NUMBER(10) NOT NULL,
    Customer_id NUMBER(10) NOT NULL,
    Staff_id NUMBER(10) NOT NULL,
    DriverRequired CHAR(1) NOT NULL 
        CHECK (DriverRequired IN ('Y','N')),
    Driver_id NUMBER(10),
    Rent_StartDate DATE NOT NULL,
    Rent_EndDate DATE NOT NULL,
    RateNoBooking NUMBER(10,2),
    PriceBasis VARCHAR2(30),

    Status VARCHAR2(20) NOT NULL 
        CHECK (Status IN ('Canceled','Reserved','Free')),

    PaymentStatus VARCHAR2(20) NOT NULL 
        CHECK (PaymentStatus IN ('PAID','PARTIALLY PAID','UNPAID')),

    CONSTRAINT fk_res_vehicle 
        FOREIGN KEY (Vehicle_id) REFERENCES Vehicle(ID),

    CONSTRAINT fk_res_customer 
        FOREIGN KEY (Customer_id) REFERENCES Customer(ID),

    CONSTRAINT fk_res_staff 
        FOREIGN KEY (Staff_id) REFERENCES Staff(ID)
);



-----------------------------------------------------------
-- 8. PAYMENT TABLE
-----------------------------------------------------------
CREATE TABLE Payment (
    ID NUMBER(10) PRIMARY KEY,
    Reservation_id NUMBER(10) NOT NULL,
    Customer_id NUMBER(10) NOT NULL,
    PaymentDate DATE NOT NULL,
    Amount NUMBER(10,2) NOT NULL,

    PaymentMethod VARCHAR2(30) NOT NULL 
        CHECK (PaymentMethod IN ('CASH','CREDITCARD','CARD','ONLINE TRANSACTION')),

    CONSTRAINT fk_payment_res 
        FOREIGN KEY (Reservation_id) REFERENCES Reservation(ID),

    CONSTRAINT fk_payment_customer 
        FOREIGN KEY (Customer_id) REFERENCES Customer(ID)
);



-----------------------------------------------------------
-- 9. MAINTENANCE TABLE
-----------------------------------------------------------
CREATE TABLE Maintenance (
    ID NUMBER(10) PRIMARY KEY,
    Vehicle_id NUMBER(10) NOT NULL UNIQUE,
    Staff_id NUMBER(10) NOT NULL,
    MaintenanceDate DATE NOT NULL,
    Description VARCHAR2(500),
    Cost NUMBER(8,2) DEFAULT 0 NOT NULL,

    CONSTRAINT fk_maint_vehicle 
        FOREIGN KEY (Vehicle_id) REFERENCES Vehicle(ID),

    CONSTRAINT fk_maint_staff 
        FOREIGN KEY (Staff_id) REFERENCES Staff(ID)
);



-----------------------------------------------------------
-- 10. DAMAGE REPORT TABLE
-----------------------------------------------------------
CREATE TABLE Damage_Report (
    ID NUMBER(10) PRIMARY KEY,
    Reservation_id NUMBER(10) NOT NULL,
    Vehicle_id NUMBER(10) NOT NULL,
    SeverityLevel VARCHAR2(20) NOT NULL,
    Description VARCHAR2(500),
    EstimatedCost NUMBER(10,2),
    ReportDate DATE NOT NULL,

    CONSTRAINT fk_damage_reservation 
        FOREIGN KEY (Reservation_id) REFERENCES Reservation(ID),

    CONSTRAINT fk_damage_vehicle 
        FOREIGN KEY (Vehicle_id) REFERENCES Vehicle(ID)
);



