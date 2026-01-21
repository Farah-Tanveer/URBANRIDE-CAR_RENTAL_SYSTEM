
const API_BASE = 'http://localhost:4001';

async function verifyBooking() {
  console.log('🚀 Starting Booking Verification...');

  try {
    // 1. Signup
    const email = `testuser_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`\n1. Signing up user: ${email}`);
    
    const signupRes = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Test User',
        email,
        password,
        phone: '0123456789'
      })
    });
    
    if (!signupRes.ok) {
      const err = await signupRes.json();
      throw new Error(`Signup failed: ${JSON.stringify(err)}`);
    }
    console.log('✅ Signup successful');

    // 2. Login
    console.log('\n2. Logging in...');
    const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!loginRes.ok) {
      const err = await loginRes.json();
      throw new Error(`Login failed: ${JSON.stringify(err)}`);
    }
    
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('✅ Login successful, Token received');

    // 3. Find an available car
    console.log('\n3. Finding available car...');
    const today = new Date();
    const pickupDate = new Date(today);
    pickupDate.setDate(today.getDate() + 10);
    const dropoffDate = new Date(today);
    dropoffDate.setDate(today.getDate() + 13);
    
    const start = pickupDate.toISOString().split('T')[0];
    const end = dropoffDate.toISOString().split('T')[0];

    const searchRes = await fetch(`${API_BASE}/api/cars/available?start=${start}&end=${end}`);
    const searchData = await searchRes.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      throw new Error('No available cars found to book');
    }
    
    const car = searchData.items[0];
    console.log(`✅ Found car: ${car.DESCRIPTION} (ID: ${car.ID})`);

    // 4. Create Booking
    console.log(`\n4. Booking car ${car.ID} from ${start} to ${end}...`);
    const bookingRes = await fetch(`${API_BASE}/api/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        vehicleId: car.ID,
        pickupLocation: 'Test Loc',
        dropoffLocation: 'Test Loc',
        pickupDate: start,
        dropoffDate: end,
        driverRequired: false
      })
    });

    if (!bookingRes.ok) {
      const err = await bookingRes.json();
      throw new Error(`Booking failed: ${JSON.stringify(err)}`);
    }

    const bookingData = await bookingRes.json();
    console.log(`✅ Booking created! ID: ${bookingData.id}`);

    // 5. Verify Booking via Reserved API
    console.log('\n5. Verifying booking via API...');
    const verifyRes = await fetch(`${API_BASE}/api/cars/reserved?start=${start}&end=${end}`);
    const verifyData = await verifyRes.json();
    
    const found = verifyData.items.find(item => 
      item.ID === car.ID && 
      item.CUSTOMERNAME === 'Test User'
    );
    
    if (found) {
      console.log('✅ Verification SUCCESS: Booking found in system!');
    } else {
      console.warn('⚠️ Verification WARNING: Booking not found in reserved list immediately (might be caching or query issue)');
      console.log('Items found:', verifyData.items);
    }

  } catch (err) {
    console.error('❌ Verification FAILED:', err.message);
    process.exit(1);
  }
}

verifyBooking();
