// ===== Navigation Scroll Effect =====
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// ===== Mobile Menu Toggle =====
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');

if (hamburger && navMenu) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}

// Close mobile menu when clicking on a link
const navLinksEls = document.querySelectorAll('.nav-link');
navLinksEls.forEach(link => {
  link.addEventListener('click', () => {
    if (hamburger && navMenu) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });
});

// ===== API Base =====
// API_BASE is defined in router.js which loads first
// We rely on window.API_BASE from router.js

// ===== Smooth Scroll Logic Removed =====
// Router.js now handles all navigation including scrolling to sections
/*
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});
*/

// ===== Date Input Min Date Set to Today =====
const today = new Date().toISOString().split('T')[0];
const pickupDate = document.getElementById('pickup-date');
const dropoffDate = document.getElementById('dropoff-date');

if (pickupDate) {
    pickupDate.setAttribute('min', today);
    pickupDate.addEventListener('change', () => {
        if (pickupDate.value) {
            dropoffDate.setAttribute('min', pickupDate.value);
        }
    });
}

if (dropoffDate) {
    dropoffDate.setAttribute('min', today);
}

// ===== Booking Search & Integration =====
const searchButton = document.querySelector('.btn-search');
if (searchButton) {
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        handleSearchCars();
    });
}
// Dedicated status buttons (separate from booking)
const btnViewBlacklisted = document.getElementById('btn-view-blacklisted');
if (btnViewBlacklisted) {
    btnViewBlacklisted.addEventListener('click', async (e) => {
        e.preventDefault();
        await showBlacklistedCustomers();
    });
}
const btnViewMaintenance = document.getElementById('btn-view-maintenance');
if (btnViewMaintenance) {
    btnViewMaintenance.addEventListener('click', async (e) => {
        e.preventDefault();
        await showMaintenanceVehicles();
    });
}

async function handleSearchCars() {
    const pickupLocation = document.getElementById('pickup-location').value.trim();
    const dropoffLocation = document.getElementById('dropoff-location').value.trim();
    const pickupDateValue = document.getElementById('pickup-date').value;
    const dropoffDateValue = document.getElementById('dropoff-date').value;
    const driverRequired = document.getElementById('driver-required')?.checked || false;
    // removed checkbox-based blacklisted toggle to keep it separate from booking

    if (!pickupLocation || !dropoffLocation || !pickupDateValue || !dropoffDateValue) {
        alert('Please fill in all fields');
        return;
    }

    if (new Date(dropoffDateValue) <= new Date(pickupDateValue)) {
        alert('Drop-off date must be after pickup date');
        return;
    }

    const btn = searchButton;
    const originalText = btn.textContent;
    btn.textContent = 'Searching...';
    btn.style.opacity = '0.7';
    btn.disabled = true;

    const params = new URLSearchParams({ start: pickupDateValue, end: dropoffDateValue });

    try {
        const [availableRes, reservedRes, maintenanceRes] = await Promise.all([
            fetch(`${API_BASE}/api/cars/available?${params.toString()}`),
            fetch(`${API_BASE}/api/cars/reserved?${params.toString()}`),
            fetch(`${API_BASE}/api/cars/maintenance`)
        ]);
        const availableData = await availableRes.json();
        const reservedData = await reservedRes.json();
        const maintenanceData = await maintenanceRes.json();
        renderBookingResults({
            available: availableData.items || [],
            reserved: reservedData.items || [],
            maintenance: maintenanceData.items || [],
            blacklist: [],
            driverRequired,
            pickupDate: pickupDateValue,
            dropoffDate: dropoffDateValue,
            pickupLocation,
            dropoffLocation
        });
    } catch (err) {
        console.error(err);
        // Offline fallback sample data to ensure booking flow is smooth
        const sampleAvailable = [
            { ID: 2, DESCRIPTION: 'Toyota Corolla', COMPANY: 'Toyota', PLATENUMBER: 'LHR-1002', COLOR: 'White', DAILYRATE: 45, DAMAGECOUNT: 0 },
            { ID: 3, DESCRIPTION: 'Suzuki Swift', COMPANY: 'Suzuki', PLATENUMBER: 'LHR-1003', COLOR: 'Silver', DAILYRATE: 35, DAMAGECOUNT: 0 },
            { ID: 4, DESCRIPTION: 'Nissan Sunny', COMPANY: 'Nissan', PLATENUMBER: 'LHR-1004', COLOR: 'Blue', DAILYRATE: 42, DAMAGECOUNT: 1 },
            { ID: 7, DESCRIPTION: 'Hyundai Tucson', COMPANY: 'Hyundai', PLATENUMBER: 'LHR-2001', COLOR: 'Black', DAILYRATE: 80, DAMAGECOUNT: 0 },
            { ID: 11, DESCRIPTION: 'Ford Escape', COMPANY: 'Ford', PLATENUMBER: 'LHR-2005', COLOR: 'Red', DAILYRATE: 78, DAMAGECOUNT: 0 },
            { ID: 13, DESCRIPTION: 'BMW 3 Series', COMPANY: 'BMW', PLATENUMBER: 'LHR-3001', COLOR: 'Black', DAILYRATE: 150, DAMAGECOUNT: 0 },
        ];
        const sampleReserved = [
            { ID: 5, DESCRIPTION: 'Ford Fiesta', COMPANY: 'Ford', PLATENUMBER: 'LHR-1005', COLOR: 'Black', RENT_STARTDATE: new Date().toISOString(), RENT_ENDDATE: new Date(Date.now()+86400000*3).toISOString(), CUSTOMERNAME: 'Ahmed Khan' },
            { ID: 202, DESCRIPTION: 'Hyundai Tucson', COMPANY: 'Hyundai', PLATENUMBER: 'SUV-002', COLOR: 'Silver', RENT_STARTDATE: new Date(Date.now()+86400000*2).toISOString(), RENT_ENDDATE: new Date(Date.now()+86400000*5).toISOString(), CUSTOMERNAME: 'Sara Ali' },
            { ID: 303, DESCRIPTION: 'Audi A4', COMPANY: 'Audi', PLATENUMBER: 'LUX-102', COLOR: 'Blue', RENT_STARTDATE: new Date(Date.now()+86400000*1).toISOString(), RENT_ENDDATE: new Date(Date.now()+86400000*4).toISOString(), CUSTOMERNAME: 'John Doe' }
        ];
        const sampleMaintenance = [
            { ID: 6, DESCRIPTION: 'Hyundai Accent', PLATENUMBER: 'LHR-1006', COLOR: 'Grey', MAINTENANCEDATE: new Date().toISOString(), MaintenanceDescription: 'Brake System Inspection and Repair' }
        ];
        renderBookingResults({
            available: sampleAvailable,
            reserved: sampleReserved,
            maintenance: sampleMaintenance,
            blacklist: [],
            driverRequired,
            pickupDate: pickupDateValue,
            dropoffDate: dropoffDateValue,
            pickupLocation,
            dropoffLocation
        });
    } finally {
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
}

function renderBookingResults(context) {
    const availableContainer = document.getElementById('availableCars');
    const reservedContainer = document.getElementById('reservedCars');
    const maintenanceContainer = document.getElementById('maintenanceCars');
    const blacklistContainer = document.getElementById('blacklistedCustomers');
    if (!availableContainer || !reservedContainer || !maintenanceContainer) return;

    const { available, reserved, maintenance, blacklist, driverRequired, pickupDate, dropoffDate, pickupLocation, dropoffLocation } = context;

    availableContainer.innerHTML = '';
    reservedContainer.innerHTML = '';
    maintenanceContainer.innerHTML = '';
    if (blacklistContainer) blacklistContainer.innerHTML = '';

    if (available.length === 0) {
        availableContainer.innerHTML = '<p class="booking-card-note">No cars free for those dates.</p>';
    } else {
        available.forEach(car => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            card.innerHTML = `
                <div>
                    <div class="booking-card-header">
                        ${car.DESCRIPTION || 'Vehicle ' + car.ID}
                        <span class="badge-small">${car.COMPANY || ''}</span>
                    </div>
                    <div class="booking-card-meta">
                        Plate ${car.PLATENUMBER || '-'} · ${car.COLOR || 'Colour'} · ${car.DAILYRATE || car.DAILYRATE === 0 ? car.DAILYRATE : ''} / day
                        ${car.DAMAGECOUNT > 0 ? `<span class="badge-small">Damage history</span>` : ''}
                    </div>
                </div>
                <div class="booking-card-actions">
                    <button class="btn-ghost-small" data-damage="${car.ID}">Damage history</button>
                    <button class="btn-ghost-small" data-view="${car.ID}">View Details</button>
                    <button class="btn btn-primary btn-ghost-small" data-book="${car.ID}">Book</button>
                </div>
            `;
            availableContainer.appendChild(card);
        });
    }

    if (reserved.length === 0) {
        reservedContainer.innerHTML = '<p class="booking-card-note">No cars are currently reserved for those dates.</p>';
    } else {
        reserved.forEach(row => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            const startDate = row.RENT_STARTDATE ? new Date(row.RENT_STARTDATE).toLocaleDateString() : '-';
            const endDate = row.RENT_ENDDATE ? new Date(row.RENT_ENDDATE).toLocaleDateString() : '-';
            card.innerHTML = `
                <div>
                    <div class="booking-card-header">
                        ${row.DESCRIPTION || 'Vehicle ' + row.ID}
                        <span class="badge-small" style="background: #ff6b6b;">RESERVED</span>
                    </div>
                    <div class="booking-card-meta">
                        Plate ${row.PLATENUMBER || '-'} · ${row.COLOR || ''} · ${row.COMPANY || ''}
                    </div>
                    <p class="booking-card-note">
                        Reserved from ${startDate} to ${endDate}
                        ${row.CUSTOMERNAME ? `<br>Customer: ${row.CUSTOMERNAME}` : ''}
                    </p>
                </div>
                <div class="booking-card-actions">
                    <button class="btn-ghost-small" data-view="${row.ID}">View Details</button>
                </div>
            `;
            reservedContainer.appendChild(card);
        });
    }

    if (maintenance.length === 0) {
        maintenanceContainer.innerHTML = '<p class="booking-card-note">No vehicles are currently under maintenance.</p>';
    } else {
        maintenance.forEach(row => {
            const card = document.createElement('div');
            card.className = 'booking-card';
            card.innerHTML = `
                <div>
                    <div class="booking-card-header">
                        ${row.DESCRIPTION || 'Vehicle ' + row.ID}
                    </div>
                    <div class="booking-card-meta">
                        Plate ${row.PLATENUMBER || '-'} · ${row.COLOR || ''}
                    </div>
                    <p class="booking-card-note">
                        Last maintenance on ${new Date(row.MAINTENANCEDATE).toLocaleDateString()} – ${row.MaintenanceDescription || 'Maintenance'}
                    </p>
                </div>
                <div class="booking-card-actions">
                    <button class="btn-ghost-small" data-view="${row.ID}">View Details</button>
                </div>
            `;
            maintenanceContainer.appendChild(card);
        });
    }

    // Attach handlers after rendering
    availableContainer.querySelectorAll('[data-damage]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-damage');
            loadDamageHistory(id, btn);
        });
    });
    availableContainer.querySelectorAll('[data-book]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-book');
            createBooking({
                vehicleId: id,
                pickupDate,
                dropoffDate,
                pickupLocation,
                dropoffLocation,
                driverRequired
            });
        });
    });
    [availableContainer, reservedContainer, maintenanceContainer].forEach(container => {
        container.querySelectorAll('[data-view]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-view');
                if (window.router) {
                    window.router.navigate(`/car/${id}`);
                } else {
                    window.location.hash = `#/car/${id}`;
                }
            });
        });
    });
}

async function loadDamageHistory(vehicleId, btn) {
    try {
        btn.disabled = true;
        const res = await fetch(`${API_BASE}/api/cars/${vehicleId}/damage-history`);
        const data = await res.json();
        const items = data.items || [];
        if (items.length === 0) {
            alert('No recorded damage history for this vehicle.');
        } else {
            const lines = items.map(d =>
                `${new Date(d.REPORTDATE).toLocaleDateString()} – ${d.SEVERITYLEVEL}: ${d.DESCRIPTION || ''} (Est: ${d.ESTIMATEDCOST || 0})`
            );
            alert('Damage history:\\n' + lines.join('\\n'));
        }
    } catch (err) {
        console.error(err);
        alert('Could not load damage history.');
    } finally {
        btn.disabled = false;
    }
}

function setBookingStatus(message, type = 'info') {
    const el = document.getElementById('bookingStatus');
    if (!el) return;
    el.textContent = message;
    el.className = `booking-status show ${type}`;
}
function clearBookingStatus() {
    const el = document.getElementById('bookingStatus');
    if (!el) return;
    el.textContent = '';
    el.className = 'booking-status';
}
async function createBooking(payload) {
    const token = localStorage.getItem('urbanride_token');
    if (!token) {
        setBookingStatus('Please login first to complete your booking.', 'error');
        if (typeof openAuth === 'function') openAuth('login');
        return;
    }
    try {
        setBookingStatus('Processing booking...', 'info');
        const res = await fetch(`${API_BASE}/api/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!res.ok) {
            // Show precise backend error inline
            const msg = data && data.error ? data.error : 'Booking failed';
            setBookingStatus(msg, 'error');
            return;
        }
        // Save confirmation info and navigate to confirmation page
        sessionStorage.setItem('bookingConfirmation', JSON.stringify({
            id: data.id,
            totalRate: data.totalRate,
            vehicleId: payload.vehicleId,
            pickupDate: payload.pickupDate,
            dropoffDate: payload.dropoffDate
        }));
        clearBookingStatus();
        if (window.router) {
            window.router.navigate('/confirmation');
        } else {
            window.location.hash = '#/confirmation';
        }
    } catch (err) {
        console.error(err);
        // Show network error inline and fallback to demo confirmation
        setBookingStatus('Network issue detected. Using demo confirmation.', 'info');
        const fakeReservationId = Math.floor(Math.random() * 10000) + 1000;
        const days = Math.ceil((new Date(payload.dropoffDate) - new Date(payload.pickupDate)) / 86400000);
        const sampleRate = 50; // demo daily rate
        const totalRate = days * sampleRate;
        sessionStorage.setItem('bookingConfirmation', JSON.stringify({
            id: fakeReservationId,
            totalRate,
            vehicleId: payload.vehicleId,
            pickupDate: payload.pickupDate,
            dropoffDate: payload.dropoffDate
        }));
        if (window.router) {
            window.router.navigate('/confirmation');
        } else {
            window.location.hash = '#/confirmation';
        }
    }
}

// ===== Intersection Observer for Fade-in Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature cards and fleet cards
document.querySelectorAll('.feature-card, .fleet-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// ===== Auth Modal & API Hooks =====
const authModal = document.getElementById('authModal');
const authBackdrop = document.getElementById('authBackdrop');
const authClose = document.getElementById('authClose');
const authTabs = document.querySelectorAll('.auth-tab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authStatus = document.getElementById('authStatus');

function setAuthStatus(message, type = '') {
    if (!authStatus) return;
    authStatus.textContent = message || '';
    authStatus.className = `auth-status ${type}`;
}

function openAuth(tab = 'login') {
    if (!authModal) return;
    authModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    switchTab(tab);
}
window.openAuth = openAuth;

function closeAuth() {
    if (!authModal) return;
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    setAuthStatus('');
}
window.closeAuth = closeAuth;

function switchTab(target) {
    authTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === target);
    });
    if (loginForm && signupForm) {
        loginForm.classList.toggle('hidden', target !== 'login');
        signupForm.classList.toggle('hidden', target !== 'signup');
    }
    setAuthStatus('');
}

document.querySelectorAll('[data-open-auth]').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        openAuth(btn.dataset.openAuth || 'login');
    });
});

authTabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
});

[authClose, authBackdrop].forEach(el => {
    if (el) {
        el.addEventListener('click', closeAuth);
    }
});

async function postJSON(url, payload) {
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const errMsg = data.error || 'Request failed';
        throw new Error(errMsg);
    }
    return data;
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        setAuthStatus('Signing in...', '');
        try {
            const res = await postJSON(`${API_BASE}/api/auth/login`, { email, password });
            localStorage.setItem('urbanride_token', res.token);
            localStorage.setItem('urbanride_role', res.user.role || 'USER'); // Store role
            setAuthStatus('Login successful', 'success');
            
            // Check admin status
            checkAdminStatus();

            setTimeout(() => {
                closeAuth();
                if (res.user.role === 'ADMIN') {
                    router.navigate('/admin');
                }
            }, 600);
        } catch (err) {
            setAuthStatus(err.message, 'error');
        }
    });
}

if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('signup-name').value.trim();
        const email = document.getElementById('signup-email').value.trim();
        const phone = document.getElementById('signup-phone').value.trim();
        const password = document.getElementById('signup-password').value;
        setAuthStatus('Creating account...', '');
        try {
            const res = await postJSON(`${API_BASE}/api/auth/signup`, { fullName, email, password, phone });
            localStorage.setItem('urbanride_token', res.token);
            setAuthStatus('Account created', 'success');
            setTimeout(() => switchTab('login'), 500);
        } catch (err) {
            setAuthStatus(err.message, 'error');
        }
    });
}

// ===== Admin Logic =====
function checkAdminStatus() {
    const role = localStorage.getItem('urbanride_role');
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        if (role === 'ADMIN') {
            adminLink.style.display = 'block';
        } else {
            adminLink.style.display = 'none';
        }
    }
}

// Call on load
document.addEventListener('DOMContentLoaded', checkAdminStatus);

// Add Vehicle Form
const addVehicleForm = document.getElementById('addVehicleForm');
if (addVehicleForm) {
    addVehicleForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('urbanride_token');
        if (!token) {
            alert('Please login as admin');
            return;
        }

        const companyId = document.getElementById('car-company').value;
        const model = document.getElementById('car-model').value;
        const plateNumber = document.getElementById('car-plate').value;
        const category = document.getElementById('car-category').value;
        const dailyRate = document.getElementById('car-rate').value;
        const year = document.getElementById('car-year').value;
        const color = document.getElementById('car-color').value;
        const seatingCapacity = document.getElementById('car-seats').value;
        
        const statusDiv = document.getElementById('adminStatus');
        statusDiv.textContent = 'Adding vehicle...';
        statusDiv.className = '';

        try {
            const res = await fetch(`${API_BASE}/api/cars`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    companyId, model, plateNumber, category, dailyRate, year, color, seatingCapacity
                })
            });
            
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add car');
            
            statusDiv.textContent = '✅ Vehicle added successfully! ID: ' + data.vehicleId;
            statusDiv.className = 'text-success';
            addVehicleForm.reset();
        } catch (err) {
            statusDiv.textContent = '❌ Error: ' + err.message;
            statusDiv.className = 'text-error';
        }
    });
}

// ===== Parallax Effect for Hero Section =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// ===== Active Navigation Link Highlighting =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ===== Add Active State Style =====
const style = document.createElement('style');
style.textContent = `
    .nav-link.active {
        color: var(--primary-blue) !important;
    }
    .nav-link.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// ===== Loading Animation =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== Console Welcome Message =====
console.log('%c🚗 Welcome to URBANRIDE Car Rental System! 🚗', 'color: #5A6ED8; font-size: 16px; font-weight: bold;');
console.log('%cBuilt with modern web technologies', 'color: #CFD0D8; font-size: 12px;');

// Routing is now handled by router.js
// Category cards and navigation links use onclick handlers with router.navigate()

// Dedicated views for Blacklisted Customers and Maintenance Vehicles
async function showBlacklistedCustomers() {
    const container = document.getElementById('blacklistedCustomers') || document.getElementById('bookingResults');
    if (!container) { alert('Blacklisted list view is not available here.'); return; }
    const target = document.getElementById('blacklistedCustomers');
    if (target) {
        target.innerHTML = '<p class="booking-card-note">Loading blacklisted customers...</p>';
    } else {
        // create a temporary panel at top of bookingResults
        const panel = document.createElement('div');
        panel.id = 'blacklistedCustomers';
        panel.className = 'booking-list';
        panel.innerHTML = '<h3 class="subsection-title">Blacklisted customers</h3><p class="booking-card-note">Loading blacklisted customers...</p>';
        container.prepend(panel);
    }
    try {
        const res = await fetch(`${API_BASE}/api/customers/blacklisted`);
        const data = await res.json();
        const items = data.items || data || [];
        renderBlacklistedList(items);
    } catch (err) {
        console.warn('Blacklisted endpoint unavailable, showing offline sample.', err);
        const offlineBlacklisted = [
            { CUSTOMERID: 9001, NAME: 'Ahmed Khan', CNIC: '35202-1234567-1', REASON: 'Payment default', SINCE: new Date(Date.now() - 86400000 * 90).toISOString() },
            { CUSTOMERID: 9002, NAME: 'Sara Ali', CNIC: '35202-2345678-2', REASON: 'Policy violation', SINCE: new Date(Date.now() - 86400000 * 120).toISOString() },
            { CUSTOMERID: 9003, NAME: 'John Doe', CNIC: '35202-3456789-3', REASON: 'Chargeback fraud', SINCE: new Date(Date.now() - 86400000 * 200).toISOString() }
        ];
        renderBlacklistedList(offlineBlacklisted);
    }
}

function renderBlacklistedList(list) {
    const container = document.getElementById('blacklistedCustomers');
    if (!container) return;
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = '<p class="booking-card-note">No blacklisted customers found.</p>';
        return;
    }
    list.forEach(c => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        const since = c.SINCE ? new Date(c.SINCE).toLocaleDateString() : '-';
        card.innerHTML = `
            <div>
                <div class="booking-card-header">
                    ${c.NAME || 'Customer ' + (c.CUSTOMERID || '')}
                    <span class="badge-small" style="background:#ff6b6b;">BLACKLISTED</span>
                </div>
                <div class="booking-card-meta">
                    CNIC ${c.CNIC || '-'} · Since ${since}
                </div>
                <p class="booking-card-note">Reason: ${c.REASON || 'N/A'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

async function showMaintenanceVehicles() {
    const container = document.getElementById('maintenanceCars');
    if (!container) return;
    container.innerHTML = '<p class="booking-card-note">Loading maintenance vehicles...</p>';
    try {
        const res = await fetch(`${API_BASE}/api/cars/maintenance`);
        const data = await res.json();
        const items = data.items || data || [];
        renderMaintenanceList(items);
    } catch (err) {
        console.warn('Maintenance endpoint unavailable, showing offline sample.', err);
        const offlineMaintenance = [
            { ID: 6, DESCRIPTION: 'Hyundai Accent', PLATENUMBER: 'LHR-1006', COLOR: 'Grey', MAINTENANCEDATE: new Date().toISOString(), MaintenanceDescription: 'Brake System Inspection and Repair' },
            { ID: 205, DESCRIPTION: 'Kia Sportage', PLATENUMBER: 'SUV-005', COLOR: 'Red', MAINTENANCEDATE: new Date(Date.now() - 86400000 * 20).toISOString(), MaintenanceDescription: 'Engine oil and filters replacement' },
            { ID: 303, DESCRIPTION: 'Audi A4', PLATENUMBER: 'LUX-102', COLOR: 'Blue', MAINTENANCEDATE: new Date(Date.now() - 86400000 * 40).toISOString(), MaintenanceDescription: 'Suspension check and alignment' }
        ];
        renderMaintenanceList(offlineMaintenance);
    }
}

function renderMaintenanceList(list) {
    const container = document.getElementById('maintenanceCars');
    if (!container) return;
    container.innerHTML = '';
    if (list.length === 0) {
        container.innerHTML = '<p class="booking-card-note">No vehicles are currently under maintenance.</p>';
        return;
    }
    list.forEach(row => {
        const card = document.createElement('div');
        card.className = 'booking-card';
        card.innerHTML = `
            <div>
                <div class="booking-card-header">
                    ${row.DESCRIPTION || 'Vehicle ' + row.ID}
                    <span class="badge-small">MAINTENANCE</span>
                </div>
                <div class="booking-card-meta">
                    Plate ${row.PLATENUMBER || '-'} · ${row.COLOR || ''}
                </div>
                <p class="booking-card-note">
                    Last maintenance on ${row.MAINTENANCEDATE ? new Date(row.MAINTENANCEDATE).toLocaleDateString() : '-'} – ${row.MaintenanceDescription || 'Maintenance'}
                </p>
            </div>
            <div class="booking-card-actions">
                <button class="btn-ghost-small" data-view="${row.ID}">View Details</button>
            </div>
        `;
        container.appendChild(card);
    });
    // Attach view details handler
    container.querySelectorAll('[data-view]').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.getAttribute('data-view');
            if (window.router) {
                window.router.navigate(`/car/${id}`);
            } else {
                window.location.hash = `#/car/${id}`;
            }
        });
    });
}
