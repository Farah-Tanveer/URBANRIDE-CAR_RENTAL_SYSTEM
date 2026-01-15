-----------------------------------------------------------

-- CAR RENTAL MANAGEMENT SYSTEM  

-----------------------------------------------------------


-----------------------------------------------------------
-- 1. Vehicles With Highest Maintenance Cost
-----------------------------------------------------------
SELECT  
    v.ID AS VehicleID, 
    pn.PlateNumber, 
    SUM(m.Cost) AS TotalMaintenanceCost 
FROM Vehicle v 
JOIN Maintenance m ON m.Vehicle_id = v.ID 
JOIN PlateNumber pn ON pn.Vehicle_id = v.ID 
GROUP BY v.ID, pn.PlateNumber 
ORDER BY TotalMaintenanceCost DESC;



-----------------------------------------------------------
-- 2. Vehicles Generating Highest Rental Revenue (Fully Paid)
-----------------------------------------------------------
SELECT v.ID, v.Color, SUM(p.Amount) AS Revenue  
FROM Vehicle v  
JOIN Reservation r ON v.ID = r.Vehicle_id  
JOIN Payment p ON r.ID = p.Reservation_id  
WHERE r.PaymentStatus = 'PAID'  
GROUP BY v.ID, v.Color  
HAVING SUM(p.Amount) = (  
    SELECT MAX(TotalRev)  
    FROM (  
        SELECT SUM(p2.Amount) AS TotalRev  
        FROM Reservation r2  
        JOIN Payment p2 ON r2.ID = p2.Reservation_id  
        WHERE r2.PaymentStatus = 'PAID'
        GROUP BY r2.Vehicle_id  
    )  
);



-----------------------------------------------------------
-- 3. Vehicles Never Reserved
-----------------------------------------------------------
SELECT v.ID, v.Color  
FROM Vehicle v  
WHERE v.ID NOT IN (SELECT DISTINCT Vehicle_id FROM Reservation);



-----------------------------------------------------------
-- 4. Vehicles With HIGH Severity Damage & Related Maintenance
-----------------------------------------------------------
SELECT  
    v.ID,  
    v.Color,  
    d.SeverityLevel,  
    m.Description AS MaintenanceReason  
FROM Vehicle v  
JOIN Damage_Report d ON v.ID = d.Vehicle_id  
JOIN Maintenance m ON v.ID = m.Vehicle_id  
WHERE d.SeverityLevel = 'HIGH';



-----------------------------------------------------------
-- 5. Staff With Above-Average Reservation Workload
-----------------------------------------------------------
SELECT  
    s.ID,  
    s.FirstName,  
    COUNT(r.ID) AS TotalReservations  
FROM Staff s  
JOIN Reservation r ON s.ID = r.Staff_id  
GROUP BY s.ID, s.FirstName  
HAVING COUNT(r.ID) > (
    SELECT AVG(res_count)
    FROM (
        SELECT COUNT(*) AS res_count
        FROM Reservation
        GROUP BY Staff_id
    )
);



-----------------------------------------------------------
-- 6. Customers Whose Rentals Were Later Reported as Damaged
-----------------------------------------------------------
SELECT DISTINCT  
    c.ID,  
    c.FirstName,  
    c.LastName  
FROM Customer c  
JOIN Reservation r ON c.ID = r.Customer_id  
JOIN Damage_Report d ON r.ID = d.Reservation_id;



-----------------------------------------------------------
-- 7. Vehicles Reserved But With No Payment Record
-----------------------------------------------------------
SELECT v.ID, v.Color  
FROM Vehicle v  
JOIN Reservation r ON v.ID = r.Vehicle_id  
WHERE r.PaymentStatus = 'UNPAID'  
AND r.ID NOT IN (SELECT Reservation_id FROM Payment);



-----------------------------------------------------------
-- 8. Loss-Making Vehicles (Maintenance Cost > Rental Revenue)
-----------------------------------------------------------
SELECT  
    v.ID,  
    v.Color,  
    (SELECT NVL(SUM(m.Cost),0)  
     FROM Maintenance m  
     WHERE m.Vehicle_id = v.ID) AS MaintenanceCost,  
     
    (SELECT NVL(SUM(p.Amount),0)  
     FROM Reservation r  
     JOIN Payment p ON r.ID = p.Reservation_id  
     WHERE r.Vehicle_id = v.ID) AS RentalRevenue  
FROM Vehicle v  
WHERE  
    (SELECT NVL(SUM(m.Cost),0) FROM Maintenance m WHERE m.Vehicle_id = v.ID)  
    >  
    (SELECT NVL(SUM(p.Amount),0)  
     FROM Reservation r  
     JOIN Payment p ON r.ID = p.Reservation_id  
     WHERE r.Vehicle_id = v.ID);



-----------------------------------------------------------
-- 9. Blacklisted Customers & Their Reservation History
-----------------------------------------------------------
SELECT  
    c.ID AS CustomerID, 
    c.FirstName || ' ' || c.LastName AS CustomerName, 
    c.Email, 
    r.ID AS ReservationID, 
    r.Status, 
    r.PaymentStatus 
FROM Customer c 
LEFT JOIN Reservation r ON r.Customer_id = c.ID 
WHERE c.BlackListStatus = 'Y' 
ORDER BY c.ID;



-----------------------------------------------------------
-- 10. Active Reservations With Customer, Vehicle, Company & Payment Info
-----------------------------------------------------------
SELECT  
    r.ID AS ReservationID, 
    c.FirstName || ' ' || c.LastName AS CustomerName, 
    v.ID AS VehicleID, 
    comp.Name AS CompanyName, 
    r.Rent_StartDate, 
    r.Rent_EndDate, 
    NVL(SUM(p.Amount), 0) AS TotalPaid, 
    r.PaymentStatus 
FROM Reservation r 
JOIN Customer c ON r.Customer_id = c.ID 
JOIN Vehicle v ON r.Vehicle_id = v.ID 
JOIN Company comp ON v.Company_id = comp.ID 
LEFT JOIN Payment p ON p.Reservation_id = r.ID 
WHERE r.Status = 'Reserved' 
GROUP BY  
    r.ID, c.FirstName, c.LastName, v.ID,  
    comp.Name, r.Rent_StartDate, r.Rent_EndDate, r.PaymentStatus;



