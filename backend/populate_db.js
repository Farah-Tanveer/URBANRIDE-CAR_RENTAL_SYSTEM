require('dotenv').config();
const fs = require('fs');
const path = require('path');
const oracledb = require('oracledb');
const { initPool, getConnection, closePool } = require('./db');

// Try to enable Thick mode
try {
  oracledb.initOracleClient();
} catch (err) {
  console.log('Oracle Client not found or already initialized.');
}

async function populateDB() {
  console.log('\n--- 🏗️ POPULATING DATABASE WITH TEST DATA ---\n');
  
  try {
    await initPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING
    });
    const conn = await getConnection();

    const sqlPath = path.join(__dirname, 'sql', 'DML.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon to get individual statements
    // We filter out empty statements and trim whitespace
    const statements = sqlContent
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute.`);

    for (let i = 0; i < statements.length; i++) {
      let stmt = statements[i];
      // Skip comments if the whole statement is a comment (starts with --)
      // But some statements have comments inside.
      // Better to just execute. Oracle ignores comments.
      
      // However, splitting by ; might leave trailing comments attached to nothing or next statement.
      // Let's just try executing.
      
      try {
        console.log(`Executing statement ${i + 1}/${statements.length}...`);
        // console.log(stmt.substring(0, 50) + '...'); 
        await conn.execute(stmt);
      } catch (err) {
        // Ignore "table or view does not exist" for DELETEs if it's the first run
        if (stmt.toUpperCase().startsWith('DELETE') && err.message.includes('ORA-00942')) {
           console.log('   (Skipping delete: table does not exist)');
        } else {
           console.error(`❌ Error executing statement ${i + 1}:`, err.message);
           // Don't throw, try to continue (best effort)
        }
      }
    }

    await conn.commit();
    console.log('\n✅ Database population complete!');
    await conn.close();

  } catch (err) {
    console.error('❌ Fatal Error:', err);
  } finally {
    await closePool();
  }
}

populateDB();
