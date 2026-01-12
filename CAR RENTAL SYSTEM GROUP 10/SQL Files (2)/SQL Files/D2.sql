-------------------------------------
--1.SEQUENCES
-------------------------------------
--Payment Sequence

CREATE SEQUENCE Payment_seq START WITH 200 INCREMENT BY 1;

--Maintenance sequence

CREATE SEQUENCE Maintenance_seq START WITH 100 INCREMENT BY 1;
--Vehicle Sequence

CREATE SEQUENCE seq_vehicle
START WITH 1
INCREMENT BY 1;

--Company Sequence

CREATE SEQUENCE seq_company
START WITH 1
INCREMENT BY 1;

--Staff Sequence

CREATE SEQUENCE seq_staff
START WITH 1
INCREMENT BY 1;

--Role Sequence

CREATE SEQUENCE seq_role
START WITH 1
INCREMENT BY 1;


--Customer Sequence

CREATE SEQUENCE seq_customer
START WITH 1
INCREMENT BY 1;

--Reservation Sequence
CREATE SEQUENCE seq_reservation
START WITH 1
INCREMENT BY 1;

--Payment Sequence

CREATE SEQUENCE seq_payment
START WITH 1
INCREMENT BY 1;

--Maintenance Sequence
CREATE SEQUENCE seq_maintenance
START WITH 1
INCREMENT BY 1;

--Damage Report Sequence
CREATE SEQUENCE seq_damage
START WITH 1
INCREMENT BY 1;
                        -------------------------------------------
                             --2. PROCEDURES
                        -------------------------------------------
-----------------------------------------------------
------=PROCEDURE: Add Reservation Safely=------
-----------------------------------------------------



CREATE OR REPLACE PROCEDURE Add_Reservation_Safely
(
    p_id              NUMBER,
    p_vehicle         NUMBER,
    p_customer        NUMBER,
    p_staff           NUMBER,
    p_driver_required CHAR,
    p_start           DATE,
    p_end             DATE,
    p_rate            NUMBER
)
AS
    v_vehicle_status VARCHAR2(20);
    v_blacklist      CHAR(1);
BEGIN

    -- 1. Check vehicle availability
    SELECT Status          
    INTO   v_vehicle_status
    FROM   Vehicle
    WHERE  ID = p_vehicle;

    IF v_vehicle_status <> 'Active' THEN
        RAISE_APPLICATION_ERROR(-20010,
        'Vehicle is not available for reservation.');
    END IF;
    -- 2. Check if customer is blacklisted
    SELECT BlackListStatus
    INTO   v_blacklist
    FROM   Customer
    WHERE  ID = p_customer;

    IF v_blacklist = 'Y' THEN
        RAISE_APPLICATION_ERROR(-20011,
        'Blacklisted customers cannot make reservations.');
    END IF;
    -- 3. Check if dates are valid
    IF p_end < p_start THEN
        RAISE_APPLICATION_ERROR(-20012,
        'End date cannot be earlier than start date.');
    END IF;
    -- 4. Insert reservation safely
    INSERT INTO Reservation
        (ID, Vehicle_id, Customer_id, Staff_id, DriverRequired,
         Rent_StartDate, Rent_EndDate, RateNoBooking,
         PriceBasis, Status, PaymentStatus)
    VALUES
        (p_id, p_vehicle, p_customer, p_staff, p_driver_required,
         p_start, p_end, p_rate,
         'Daily', 'Reserved', 'UNPAID');

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20013,
        'Invalid Vehicle ID or Customer ID.');
    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20014,
        'Unexpected error: ' || SQLERRM);
END;
/
-----------------------------------------------------
------=PROCEDURE: Cancel_Reservation=------
-----------------------------------------------------




CREATE OR REPLACE PROCEDURE Cancel_Reservation 
(
    p_reservation_id NUMBER
)
AS
    v_vehicle NUMBER;
BEGIN
    -- 1. Get Vehicle ID for this reservation
    SELECT Vehicle_id
    INTO   v_vehicle
    FROM   Reservation
    WHERE  ID = p_reservation_id;
    -- 2. Cancel reservation
    UPDATE Reservation
    SET    Status = 'Canceled',
           PaymentStatus = 'UNPAID'
    WHERE  ID = p_reservation_id;
    -- 3. Mark Vehicle as Active again
    UPDATE Vehicle
    SET    Status = 'Available'
    WHERE  ID = v_vehicle;
EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20061,
            'Cancel failed: Reservation ID not found.');

    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20062,
            'Cancellation error: ' || SQLERRM);
END Cancel_Reservation;
/

                        ----------------------------------------------------
                                      ---3. TRIGGERS---
                        ----------------------------------------------------

---------------------------------------------------------------
--Triggers: Calculate the Total Rental Amount(Payment)=------
----------------------------------------------------------------
CREATE OR REPLACE TRIGGER trg_calculate_payment
BEFORE INSERT ON Payment
FOR EACH ROW
DECLARE
    v_rate     NUMBER;
    v_start    DATE;
    v_end      DATE;
    v_days     NUMBER;
    v_amount   NUMBER;
    v_customer NUMBER;
BEGIN
    -- Fetch Reservation Data
    SELECT r.RateNoBooking,
           r.Rent_StartDate,
           r.Rent_EndDate,
           r.Customer_id
    INTO   v_rate, v_start, v_end, v_customer
    FROM   Reservation r
    WHERE  r.ID = :NEW.Reservation_id;

    -- Billing Days Calculation
    v_days := CASE 
                WHEN v_end = v_start THEN 1
                ELSE CEIL(v_end - v_start)
              END;

    -- Payment amount calculation
    v_amount := v_rate * v_days;

    -- Override user input with correct values
    :NEW.Amount        := v_amount;
    :NEW.Customer_id   := v_customer;
    :NEW.PaymentDate   := SYSDATE;

EXCEPTION
    WHEN NO_DATA_FOUND THEN
        RAISE_APPLICATION_ERROR(-20051,
           'Reservation not found OR RateNoBooking is NULL.');

    WHEN OTHERS THEN
        RAISE_APPLICATION_ERROR(-20052,
           'Payment calculation failed: ' || SQLERRM);
END;
/
---------------------------------------------------------------
--Triggers: Update Vehicle Status When Reservation Changes=------
----------------------------------------------------------------


CREATE OR REPLACE TRIGGER trg_vehicle_status_update  
AFTER INSERT OR UPDATE ON Reservation  
FOR EACH ROW  
BEGIN  
IF :NEW.Status = 'Reserved' THEN  
UPDATE Vehicle  
SET Status = 'Reserved'  
WHERE ID = :NEW.Vehicle_id;  
ELSIF :NEW.Status = 'Canceled' THEN  
UPDATE Vehicle  
SET Status = 'Available'  
WHERE ID = :NEW.Vehicle_id;  
END IF;  
END;  
/
--------------------------------------------------------------
------=TRIGGER: Auto-Create Maintenance for HIGH Damage=------
--------------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_auto_maintenance  
AFTER INSERT ON Damage_Report  
FOR EACH ROW  
WHEN (NEW.SEVERITYLEVEL = 'HIGH')  
BEGIN  
INSERT INTO Maintenance (ID, Vehicle_id, Staff_id, MaintenanceDate, 
Description, Cost)     VALUES (  
Maintenance_seq.NEXTVAL,  
:NEW.Vehicle_id,  
2,  
SYSDATE,
'Maintenance created from HIGH damage report',  
:NEW.EstimatedCost    
);  
END;  
/
---------------------------------------------------------
------=TRIGGER: Auto Payment on Reservation Insert=------
---------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_auto_payment 
AFTER INSERT ON Reservation 
FOR EACH ROW 
BEGIN 
Calculate_Reservation_Payment(:NEW.ID); 
END; 
/
-------------------------------------------------------
------=TRIGGER: Prevent Overlapping Reservations=------
-------------------------------------------------------


CREATE OR REPLACE TRIGGER trg_no_overlap_res 
BEFORE INSERT OR UPDATE ON Reservation 
FOR EACH ROW 
DECLARE 
v_count NUMBER; 
BEGIN 
SELECT COUNT(*) 
INTO v_count 
FROM Reservation 
WHERE Vehicle_id = :NEW.Vehicle_id 
AND Status IN ('Reserved', 'Confirmed') 
AND ( 
:NEW.Rent_StartDate BETWEEN Rent_StartDate AND Rent_EndDate 
OR :NEW.Rent_EndDate BETWEEN Rent_StartDate AND Rent_EndDate 
OR ( :NEW.Rent_StartDate <= Rent_StartDate AND :NEW.Rent_EndDate >= 
Rent_EndDate ) 
); 
IF v_count > 0 THEN 
RAISE_APPLICATION_ERROR(-20002, 
'This vehicle already has an active reservation in this date range.'); 
END IF; 
END; 
/

--------------------------------------------------------------
------=TRIGGER: Prevent Maintenance on Reserved Vehicle=------
--------------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_no_maintenance_if_reserved 
BEFORE INSERT ON Maintenance 
FOR EACH ROW 
DECLARE 
v_status VARCHAR2(20); 
BEGIN 
SELECT Status INTO v_status 
FROM Vehicle 
WHERE ID = :NEW.Vehicle_id; 
IF v_status IN ('Reserved', 'Rented') THEN 
RAISE_APPLICATION_ERROR( -20003, 
'Cannot insert maintenance: Vehicle is Reserved or Rented.' 
); 
END IF; 
END; 
/ 
--------------------------------------------------------------------
------=TRIGGER: Only Mechanics Can Insert Maintenance Records=------
--------------------------------------------------------------------

CREATE OR REPLACE TRIGGER trg_mech_req_main 
BEFORE INSERT ON Maintenance 
FOR EACH ROW 
DECLARE 
v_role VARCHAR2(30); 
BEGIN 
SELECT r.Name 
INTO v_role 
FROM Staff s 
JOIN Role r ON s.Role_id = r.ID 
WHERE s.ID = :NEW.Staff_id; 
IF v_role <> 'MECHANIC' AND v_role <> 'Other Staff' THEN 
RAISE_APPLICATION_ERROR( -20004, 
'Only mechanics (Other Staff role) can perform maintenance.' 
); 
END IF; 
END; 
/
-----------------------------------------------------
------=TRIGGER: Block Blacklisted Customer=----------
-----------------------------------------------------

CREATE OR REPLACE TRIGGER trg_blklist_res
BEFORE INSERT ON Reservation
FOR EACH ROW
DECLARE
    v_black CHAR(1);
BEGIN
    -- Check customer blacklist status
    SELECT BlackListStatus
    INTO   v_black
    FROM   Customer
    WHERE  ID = :NEW.Customer_id;

    -- If customer is blacklisted, stop the insert
    IF v_black = 'Y' THEN
        RAISE_APPLICATION_ERROR(
            -20001,
            'This customer is blacklisted and cannot make a reservation.'
        );
    END IF;

END trg_blklist_res;
/

                        -----------------------------------------------------
                        --4.=INDEXES=------
                        -----------------------------------------------------
           -------------1--------------
CREATE INDEX idx_maintenance_vehicle
ON Maintenance (Vehicle_id);
           ------------2---------------
CREATE INDEX idx_vehicle_status  
ON Vehicle(Status);  
                        -----------------------------------------------------
                        --5. =VIEWS=------
                        -----------------------------------------------------

-----------------------------------------------------
------=VIEW: Reservation Summary=------
-----------------------------------------------------
CREATE OR REPLACE VIEW vw_reservation_summary AS  
SELECT r.ID AS ReservationID,  
c.FirstName || ' ' || c.LastName AS CustomerName,  
v.ID AS VehicleID,  
v.Color,  
v.DailyRate,  
r.Rent_StartDate,  
r.Rent_EndDate,  
r.Status,  
p.Amount  
FROM Reservation r  
LEFT JOIN Customer c ON r.Customer_id = c.ID  
LEFT JOIN Vehicle v ON r.Vehicle_id = v.ID  
LEFT JOIN Payment p ON r.ID = p.Reservation_id; 
--------------------------------------------------------
------=VIEW: Vehicle Damage + Maintenance Summary=------
--------------------------------------------------------
CREATE OR REPLACE VIEW 
vw_vehicle_damage_maintenance AS SELECT d.Vehicle_id,  
d.SeverityLevel,  
d.Description AS DamageDetails,  
d.EstimatedCost,  
m.MaintenanceDate,  
m.Cost AS MaintenanceCost  
FROM Damage_Report d  
LEFT JOIN Maintenance m ON d.Vehicle_id = m.Vehicle_id; 
--------------------------------------------------------
------=VIEW:Customer Summary =------
-------------------------------------------------------- 
CREATE OR REPLACE VIEW vw_customer_summary AS
SELECT 
    c.ID AS CustomerID,
    c.FirstName || ' ' || c.LastName AS CustomerName,
    c.PhoneNumber,
    c.Email,
    c.Address,
    c.BlackListStatus,
    
    r.ID AS ReservationID,
    r.Rent_StartDate,
    r.Rent_EndDate,
    r.Status AS ReservationStatus,
    
    p.Amount AS LastPaymentAmount,
    p.PaymentDate AS LastPaymentDate

FROM Customer c
LEFT JOIN Reservation r 
       ON c.ID = r.Customer_id
LEFT JOIN Payment p 
       ON r.ID = p.Reservation_id;

-----------------------------------------------------------------------------------------
                                    ----THE END-----
-----------------------------------------------------------------------------------------
