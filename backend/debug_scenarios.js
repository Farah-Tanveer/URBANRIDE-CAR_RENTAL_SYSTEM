require('dotenv').config();
const oracledb = require('oracledb');
const { initPool, getConnection, closePool } = require('./db');

async function runDebugScenarios() {
  console.log('\n--- 🐞 STARTING DB DEBUGGER SCENARIOS ---\n');

  try {
    // Try to enable Thick mode for Oracle 11g support
    try {
      oracledb.initOracleClient(); 
      console.log('✅ Enabled Oracle Thick Mode (Client libraries found)');
    } catch (err) {
      console.warn('⚠️  Could not enable Thick Mode (Client libs not found in PATH). Trying Thin mode...');
      console.warn('   Note: Thin mode only supports Oracle 12.1+. If you have 11g, this might fail.');
    }

    await initPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING
    });
    console.log('✅ Database Connected Successfully');

    const conn = await getConnection();

    // 1. Check for Blacklist Status
    console.log('\n🔍 SCENARIO 1: Checking Blacklist Status for a Customer');
    // Oracle 11g compatible limit
    const custResult = await conn.execute(`SELECT ID, FirstName, LastName, BlackListStatus FROM Customer WHERE ROWNUM <= 5`);
    console.table(custResult.rows.map(r => ({
      ID: r.ID,
      Name: `${r.FIRSTNAME} ${r.LASTNAME}`,
      Blacklisted: r.BLACKLISTSTATUS === 'Y' ? '❌ YES' : '✅ NO'
    })));

    // 2. Check for Cars Under Maintenance
    console.log('\n🔍 SCENARIO 2: Checking Cars Under Maintenance');
    // Debug: List all cars and their status to verify data
    const allCars = await conn.execute(`SELECT ID, Description, Status FROM Vehicle`);
    console.log(`   (Debug info: Found ${allCars.rows.length} total cars in DB)`);
    if (allCars.rows.length > 0) {
        console.table(allCars.rows.slice(0, 5).map(r => ({ID: r.ID, Desc: r.DESCRIPTION, Status: r.STATUS})));
    }

    const maintResult = await conn.execute(`
      SELECT v.ID, v.Description, m.Description as MaintDesc, m.MaintenanceDate 
      FROM Vehicle v 
      JOIN Maintenance m ON v.ID = m.Vehicle_id 
      WHERE (v.Status = 'MAINTENANCE' OR m.MaintenanceDate > SYSDATE - 30)
      AND ROWNUM <= 5
    `);
    if (maintResult.rows.length > 0) {
      console.table(maintResult.rows.map(r => ({
        CarID: r.ID,
        Car: r.DESCRIPTION,
        Issue: r.MAINTDESC,
        Date: r.MAINTENANCEDATE
      })));
    } else {
      console.log('   No cars currently in maintenance or recently maintained.');
    }

    // 3. See Available Cars (Simulation)
    console.log('\n🔍 SCENARIO 3: Checking Available Cars for Next Week');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 10);
    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];
    
    console.log(`   Checking availability for: ${startStr} to ${endStr}`);
    
    const availResult = await conn.execute(`
      SELECT * FROM (
        SELECT v.ID, v.Description, v.DailyRate, v.Category
        FROM Vehicle v
        WHERE (UPPER(v.Status) = 'AVAILABLE' OR UPPER(v.Status) = 'MAINTENANCE' OR UPPER(v.Status) = 'RESERVED')
          AND v.ID NOT IN (
            SELECT r.Vehicle_id
            FROM Reservation r
            WHERE UPPER(r.Status) = 'RESERVED'
              AND NOT (
                r.Rent_EndDate < TO_DATE(:startStr, 'YYYY-MM-DD')
                OR r.Rent_StartDate > TO_DATE(:endStr, 'YYYY-MM-DD')
              )
          )
        ORDER BY v.DailyRate
      ) WHERE ROWNUM <= 5
    `, { startStr, endStr });
    
    console.table(availResult.rows.map(r => ({
      ID: r.ID,
      Car: r.DESCRIPTION,
      Rate: `$${r.DAILYRATE}/day`,
      Category: r.CATEGORY || 'N/A'
    })));

    // 4. See Damage History
    console.log('\n🔍 SCENARIO 4: Checking Damage History');
    const damageResult = await conn.execute(`
      SELECT * FROM (
        SELECT v.Description, d.Description as Damage, d.SeverityLevel, d.ReportDate
        FROM Damage_Report d
        JOIN Vehicle v ON v.ID = d.Vehicle_id
        ORDER BY d.ReportDate DESC
      ) WHERE ROWNUM <= 5
    `);
    if (damageResult.rows.length > 0) {
      console.table(damageResult.rows.map(r => ({
        Car: r.DESCRIPTION,
        Damage: r.DAMAGE,
        Severity: r.SEVERITYLEVEL,
        Date: r.REPORTDATE
      })));
    } else {
      console.log('   No damage reports found.');
    }

    // 5. Simulate Booking (Dry Run)
    console.log('\n🔍 SCENARIO 5: Simulating a Booking Transaction');
    if (availResult.rows.length > 0 && custResult.rows.length > 0) {
      const car = availResult.rows[0];
      const customer = custResult.rows[0];
      console.log(`   Attempting to book Car ID ${car.ID} (${car.DESCRIPTION}) for Customer ${customer.FIRSTNAME} ${customer.LASTNAME}...`);
      
      if (customer.BLACKLISTSTATUS === 'Y') {
        console.log('   🛑 BLOCKING BOOKING: Customer is blacklisted!');
      } else {
        console.log('   ✅ Customer is eligible.');
        console.log('   ✅ Car is available for selected dates.');
        console.log('   📝 [SIMULATION] Inserting Reservation record into DB...');
        console.log(`   💰 Estimated Cost: $${car.DAILYRATE * 3}`);
        console.log('   🎉 Booking would be successful!');
      }
    } else {
      console.log('   Cannot simulate booking: Missing test data (cars or customers).');
    }

    await conn.close();
    console.log('\n✅ DB Debugger Session Completed Successfully.');

  } catch (err) {
    console.error('❌ Debugger Error:', err);
  } finally {
    await closePool();
    console.log('\n--- 🏁 END OF SCENARIOS ---\n');
  }
}

runDebugScenarios();
