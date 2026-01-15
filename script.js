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

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// ===== API Base =====
const API_BASE = 'http://localhost:4000';

// ===== Smooth Scroll for Navigation Links =====
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

async function handleSearchCars() {
    const pickupLocation = document.getElementById('pickup-location').value.trim();
    const dropoffLocation = document.getElementById('dropoff-location').value.trim();
    const pickupDateValue = document.getElementById('pickup-date').value;
    const dropoffDateValue = document.getElementById('dropoff-date').value;
    const driverRequired = document.getElementById('driver-required')?.checked || false;

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
        const [availableRes, maintenanceRes] = await Promise.all([
            fetch(`${API_BASE}/api/cars/available?${params.toString()}`),
            fetch(`${API_BASE}/api/cars/maintenance`)
        ]);
        const availableData = await availableRes.json();
        const maintenanceData = await maintenanceRes.json();
        renderBookingResults({
            available: availableData.items || [],
            maintenance: maintenanceData.items || [],
            driverRequired,
            pickupDate: pickupDateValue,
            dropoffDate: dropoffDateValue,
            pickupLocation,
            dropoffLocation
        });
    } catch (err) {
        console.error(err);
        alert('Could not load cars. Make sure the backend is running.');
    } finally {
        btn.textContent = originalText;
        btn.style.opacity = '1';
        btn.disabled = false;
    }
}

function renderBookingResults(context) {
    const availableContainer = document.getElementById('availableCars');
    const maintenanceContainer = document.getElementById('maintenanceCars');
    if (!availableContainer || !maintenanceContainer) return;

    const { available, maintenance, driverRequired, pickupDate, dropoffDate, pickupLocation, dropoffLocation } = context;

    availableContainer.innerHTML = '';
    maintenanceContainer.innerHTML = '';

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
                    <button class="btn btn-primary btn-ghost-small" data-book="${car.ID}">Book</button>
                </div>
            `;
            availableContainer.appendChild(card);
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
                        Last maintenance on ${new Date(row.MAINTENANCEDATE).toLocaleDateString()} – ${row.MAINTENANCEDESCRIPTION || 'Maintenance'}
                    </p>
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

async function createBooking(payload) {
    const token = localStorage.getItem('urbanride_token');
    if (!token) {
        alert('Please login first to complete your booking.');
        openAuth('login');
        return;
    }
    try {
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
            throw new Error(data.error || 'Booking failed');
        }
        alert(`Booking confirmed! Reservation ID: ${data.id}. Total: ${data.totalRate}`);
    } catch (err) {
        console.error(err);
        alert(err.message || 'Booking failed.');
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

function closeAuth() {
    if (!authModal) return;
    authModal.classList.add('hidden');
    document.body.style.overflow = '';
    setAuthStatus('');
}

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
            setAuthStatus('Login successful', 'success');
            setTimeout(closeAuth, 600);
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
