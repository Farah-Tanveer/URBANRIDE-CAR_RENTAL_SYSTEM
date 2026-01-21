const { initPool, closePool, getConnection } = require('./db');
require('dotenv').config();
const bcrypt = require('bcryptjs');

async function seedUsers() {
  let conn;
  try {
    await initPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectionString: process.env.DB_CONNECTION_STRING
    });
    conn = await getConnection();

    console.log('Seeding users...');

    const passwordHash = await bcrypt.hash('123456', 10);
    
    // We want to ensure these customers exist in AppUser with this password
    const users = [
      { email: 'ahmed@mail.com', name: 'Ahmed Khan', phone: '03111234567' },
      { email: 'fatima@mail.com', name: 'Fatima Ali', phone: '03121234567' },
      { email: 'john@urbanride.com', name: 'John Doe', phone: '03009999999' }
    ];

    for (const u of users) {
      // 1. Check if AppUser exists
      const check = await conn.execute(
        `SELECT ID FROM AppUser WHERE Email = :email`,
        { email: u.email }
      );

      if (check.rows.length === 0) {
        console.log(`Creating AppUser for ${u.email}`);
        await conn.execute(
          `INSERT INTO AppUser (FullName, Email, PasswordHash, Phone, Role)
           VALUES (:name, :email, :hash, :phone, 'CUSTOMER')`,
          {
            name: u.name,
            email: u.email,
            hash: passwordHash,
            phone: u.phone
          }
        );
      } else {
        console.log(`Updating password for ${u.email}`);
        await conn.execute(
          `UPDATE AppUser SET PasswordHash = :hash WHERE Email = :email`,
          { hash: passwordHash, email: u.email }
        );
      }
    }

    await conn.commit();
    console.log('Users seeded successfully. Password is "123456" for all.');

  } catch (err) {
    console.error('Error seeding users:', err);
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
    await closePool();
  }
}

seedUsers();
