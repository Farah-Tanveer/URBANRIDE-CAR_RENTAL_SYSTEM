// ===== Hash-Based Router for Static File Server =====
window.API_BASE = 'http://localhost:4001';
const API_BASE = window.API_BASE;

class HashRouter {
    constructor() {
        this.routes = {};
        this.currentRoute = null;
        this.init();
    }

    init() {
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        // Handle initial load
        this.handleRoute();
    }

    // Register a route
    route(path, handler) {
        this.routes[path] = handler;
    }

    // Handle current route
    handleRoute() {
        const hash = window.location.hash.slice(1) || '/';
        
        // Handle root path
        if (hash === '/' || hash === '') {
            showHomePage();
            return;
        }

        const parts = hash.split('/').filter(p => p);
        const path = parts[0] || '';
        const route = '/' + path;
        
        // Find matching route
        let matchedRoute = null;
        let routeParams = {};

        // Check exact match first
        if (this.routes[route]) {
            matchedRoute = route;
        } else {
            // Check dynamic routes
            for (const routePath in this.routes) {
                const routePattern = routePath.split('/').filter(p => p);
                const currentPattern = parts;
                
                if (routePattern.length === currentPattern.length) {
                    let matches = true;
                    const params = {};
                    
                    for (let i = 0; i < routePattern.length; i++) {
                        if (routePattern[i].startsWith(':')) {
                            params[routePattern[i].slice(1)] = currentPattern[i];
                        } else if (routePattern[i] !== currentPattern[i]) {
                            matches = false;
                            break;
                        }
                    }
                    
                    if (matches) {
                        matchedRoute = routePath;
                        routeParams = params;
                        break;
                    }
                }
            }
        }

        if (matchedRoute && this.routes[matchedRoute]) {
            this.currentRoute = matchedRoute;
            this.routes[matchedRoute](routeParams, parts.slice(1));
        } else {
            // Unknown route, go to home
            console.log('Unknown route:', hash);
            this.navigate('/');
        }
    }

    // Navigate to a route
    navigate(path) {
        const currentHash = window.location.hash.slice(1);
        // If clicking the same link, force re-handle
        if (currentHash === path || currentHash === path.slice(1)) {
            this.handleRoute();
        } else {
            window.location.hash = path;
        }
    }
}

// Initialize router
const router = new HashRouter();

// ===== Route Handlers =====

// Home route
router.route('/', () => {
    showHomePage();
});

// Fleet route (Categories)
router.route('/fleet', () => {
    showFleetPage();
});

// Services route (Scroll to services)
router.route('/services', () => {
    showHomePage();
    setTimeout(() => {
        const el = document.getElementById('services');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
});

// Booking route (Scroll to booking)
router.route('/booking', () => {
    showHomePage();
    setTimeout(() => {
        const el = document.getElementById('booking');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
});

// Contact route (Scroll to contact)
router.route('/contact', () => {
    showHomePage();
    setTimeout(() => {
        const el = document.getElementById('contact');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
});

// About route
router.route('/about', () => {
    showAboutPage();
});

// Cars by category route (Renamed from /cars/:category to match requirements)
router.route('/category/:type', (params) => {
    showCarsPage(params.type);
});

// Keep old route for backward compatibility if needed, but redirect
router.route('/cars/:category', (params) => {
    router.navigate('/category/' + params.category);
});

// Car details route
router.route('/car/:id', (params) => {
    showCarDetailsPage(params.id);
});

// Auth routes
router.route('/login', () => {
    if (window.openAuth) window.openAuth('login');
    else router.navigate('/');
});

router.route('/signup', () => {
    if (window.openAuth) window.openAuth('signup');
    else router.navigate('/');
});

// ===== Page Rendering Functions =====

function showHomePage() {
    const container = document.getElementById('main-content');
    if (!container) return;
    
    // Remove any dynamically loaded content
    const existingDynamic = container.querySelector('.about-page, .cars-page, .car-details-page, .fleet-page');
    if (existingDynamic) {
        existingDynamic.remove();
    }
    
    // Show the original homepage content
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'block';
        window.scrollTo(0, 0);
    }
}

function showAboutPage() {
    const container = document.getElementById('main-content');
    if (!container) return;
    
    // Hide home content
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'none';
    }
    
    // Remove any existing dynamic content
    const existingDynamic = container.querySelector('.about-page, .cars-page, .car-details-page, .fleet-page');
    if (existingDynamic) {
        existingDynamic.remove();
    }
    
    const aboutDiv = document.createElement('div');
    aboutDiv.innerHTML = `
        <section class="about-page">
            <div class="container">
                <div class="about-section">
                    <h2>About URBANRIDE</h2>
                    <p>
                        URBANRIDE is a premium car rental management system designed to provide seamless, 
                        reliable, and transparent vehicle rental services. Our system is built with modern 
                        technology and Oracle database integration to ensure data integrity and real-time 
                        availability tracking.
                    </p>
                    <p>
                        We offer a wide range of vehicles across three main categories, each carefully 
                        maintained and regularly serviced to ensure your safety and comfort.
                    </p>
                </div>

                <div class="about-section">
                    <h2>Our Car Categories</h2>
                    
                    <div class="category-info">
                        <h3>Economy Cars</h3>
                        <p>
                            Perfect for everyday travel and budget-conscious customers. Our economy fleet 
                            includes fuel-efficient vehicles from trusted manufacturers like Honda, Toyota, 
                            and Suzuki. Starting from $35/day, these cars offer excellent value for money 
                            without compromising on comfort and reliability.
                        </p>
                    </div>

                    <div class="category-info">
                        <h3>SUV Vehicles</h3>
                        <p>
                            Spacious and comfortable vehicles ideal for families and group travel. Our SUV 
                            collection features 7-seater options from Hyundai, Toyota, Kia, and more. 
                            Starting from $75/day, these vehicles provide ample space, safety features, and 
                            are perfect for long journeys and outdoor adventures.
                        </p>
                    </div>

                    <div class="category-info">
                        <h3>Luxury Cars</h3>
                        <p>
                            Premium vehicles for special occasions, business travel, or when you want to 
                            travel in style. Our luxury fleet includes top-tier brands like BMW, Mercedes-Benz, 
                            and Audi. Starting from $150/day, these vehicles offer superior comfort, 
                            advanced features, and an exceptional driving experience.
                        </p>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Booking Workflow</h2>
                    <p>Our booking process is simple and straightforward:</p>
                    
                    <div class="workflow-steps">
                        <div class="workflow-step">
                            <div class="workflow-step-number">1</div>
                            <h3>Browse & Select</h3>
                            <p>Browse our fleet by category or use the search feature to find available cars for your dates</p>
                        </div>
                        <div class="workflow-step">
                            <div class="workflow-step-number">2</div>
                            <h3>View Details</h3>
                            <p>Check complete car details including features, maintenance history, and availability</p>
                        </div>
                        <div class="workflow-step">
                            <div class="workflow-step-number">3</div>
                            <h3>Book & Confirm</h3>
                            <p>Select your dates, provide pickup/dropoff locations, and confirm your booking</p>
                        </div>
                        <div class="workflow-step">
                            <div class="workflow-step-number">4</div>
                            <h3>Enjoy Your Ride</h3>
                            <p>Pick up your vehicle and enjoy a safe, comfortable journey</p>
                        </div>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Why URBANRIDE is Reliable</h2>
                    <p>We've built our system with reliability and transparency at its core:</p>
                    
                    <div class="reliability-features">
                        <div class="reliability-feature">
                            <h3>🔒 Secure Database</h3>
                            <p>
                                All data is stored in Oracle 11g database with proper constraints, 
                                ensuring data integrity and preventing conflicts.
                            </p>
                        </div>
                        <div class="reliability-feature">
                            <h3>🔍 Real-Time Availability</h3>
                            <p>
                                Our system checks availability in real-time, preventing double bookings 
                                and ensuring accurate information.
                            </p>
                        </div>
                        <div class="reliability-feature">
                            <h3>🔧 Maintenance Transparency</h3>
                            <p>
                                We believe in transparency. View complete maintenance history for any 
                                vehicle before booking, so you know exactly what you're getting.
                            </p>
                        </div>
                        <div class="reliability-feature">
                            <h3>✅ Status Tracking</h3>
                            <p>
                                Clear status indicators show if a car is available, reserved, or under 
                                maintenance, with detailed reasons when unavailable.
                            </p>
                        </div>
                        <div class="reliability-feature">
                            <h3>🛡️ Blacklist Protection</h3>
                            <p>
                                Our system automatically prevents blacklisted customers from making 
                                reservations, protecting our fleet and other customers.
                            </p>
                        </div>
                        <div class="reliability-feature">
                            <h3>📊 Damage Reporting</h3>
                            <p>
                                Complete damage history is tracked and visible, ensuring accountability 
                                and helping you make informed decisions.
                            </p>
                        </div>
                    </div>
                </div>

                <div class="about-section">
                    <h2>Contact Us</h2>
                    <p>
                        Have questions? Need assistance? Contact our customer service team:
                    </p>
                    <p>
                        <strong>Email:</strong> info@urbanride.com<br>
                        <strong>Phone:</strong> +1 (555) 123-4567<br>
                        <strong>Address:</strong> 123 Car Rental St
                    </p>
                </div>
            </div>
        </section>
    `;
    
    container.appendChild(aboutDiv.firstElementChild);
    window.scrollTo(0, 0);
}

function showFleetPage() {
    const container = document.getElementById('main-content');
    if (!container) return;
    
    // Hide home content
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'none';
    }
    
    // Remove any existing dynamic content
    const existingDynamic = container.querySelectorAll('.about-page, .cars-page, .car-details-page, .fleet-page');
    existingDynamic.forEach(el => el.remove());
    
    const fleetDiv = document.createElement('div');
    fleetDiv.innerHTML = `
        <section class="fleet-page" style="padding: 120px 0 60px;">
            <div class="container">
                <h2 class="section-title">Our Fleet</h2>
                <div class="fleet-grid">
                    <div class="fleet-card" data-category="luxury" style="cursor: pointer;" onclick="event.preventDefault(); router.navigate('/category/luxury');">
                        <div class="fleet-image luxury"></div>
                        <div class="fleet-content">
                            <h3>Luxury</h3>
                            <p>Premium vehicles for special occasions</p>
                            <span class="fleet-price">From $150/day</span>
                        </div>
                    </div>
                    <div class="fleet-card" data-category="suv" style="cursor: pointer;" onclick="event.preventDefault(); router.navigate('/category/suv');">
                        <div class="fleet-image suv"></div>
                        <div class="fleet-content">
                            <h3>SUV</h3>
                            <p>Spacious and comfortable for families</p>
                            <span class="fleet-price">From $80/day</span>
                        </div>
                    </div>
                    <div class="fleet-card" data-category="economy" style="cursor: pointer;" onclick="event.preventDefault(); router.navigate('/category/economy');">
                        <div class="fleet-image economy"></div>
                        <div class="fleet-content">
                            <h3>Economy</h3>
                            <p>Affordable and fuel-efficient options</p>
                            <span class="fleet-price">From $40/day</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
    
    container.appendChild(fleetDiv.firstElementChild);
    window.scrollTo(0, 0);
}

async function showCarsPage(category) {
    const container = document.getElementById('main-content');
    if (!container) return;
    
    // Hide home content
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'none';
    }
    
    // Remove any existing dynamic content
    const existingDynamic = container.querySelectorAll('.about-page, .cars-page, .car-details-page, .fleet-page');
    existingDynamic.forEach(el => el.remove());
    
    const categoryNames = {
        economy: 'Economy Cars',
        suv: 'SUV Vehicles',
        luxury: 'Luxury Cars'
    };
    const categoryDescs = {
        economy: 'Affordable and fuel-efficient options for everyday travel',
        suv: 'Spacious and comfortable vehicles perfect for families',
        luxury: 'Premium vehicles for special occasions and comfort'
    };

    const carsDiv = document.createElement('div');
    carsDiv.innerHTML = `
        <section class="cars-page">
            <div class="container">
                <div class="cars-header">
                    <h1 class="section-title">${categoryNames[category] || 'Cars'}</h1>
                    <p>${categoryDescs[category] || ''}</p>
                </div>
                <div id="carsContainer" class="loading">
                    <p>Loading cars...</p>
                </div>
            </div>
        </section>
    `;
    
    container.appendChild(carsDiv.firstElementChild);
    window.scrollTo(0, 0);
    
    // Load cars - include all statuses to show maintenance and reserved cars too
    try {
        const res = await fetch(`${API_BASE}/api/cars/category/${category}?includeUnavailable=true`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load cars');
        }

        const cars = data.items || [];
        const carsContainer = document.getElementById('carsContainer');
        
        if (cars.length === 0) {
            carsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No ${category} cars available at the moment.</p>
                    <p>Please check back later or browse other categories.</p>
                </div>
            `;
            return;
        }

        carsContainer.innerHTML = '<div class="cars-grid"></div>';
        const grid = carsContainer.querySelector('.cars-grid');

        cars.forEach(car => {
            const card = createCarCard(car);
            grid.appendChild(card);
        });
    } catch (err) {
        console.error(err);
        const carsContainer = document.getElementById('carsContainer');
        if (carsContainer) {
            carsContainer.innerHTML = `
                <div class="empty-state">
                    <p>Error loading cars: ${err.message}</p>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    const statusClass = car.STATUS === 'AVAILABLE' ? 'status-available' : 
                       car.STATUS === 'RESERVED' ? 'status-reserved' : 'status-maintenance';
    const statusText = car.STATUSLABEL || car.STATUS;
    const isAvailable = car.STATUS === 'AVAILABLE';
    
    card.innerHTML = `
        <div class="car-image">🚗</div>
        <div class="car-content">
            <div class="car-header">
                <h3 class="car-title">${car.DESCRIPTION || 'Vehicle ' + car.ID}</h3>
                <span class="status-badge ${statusClass}">${statusText}</span>
            </div>
            <div class="car-meta">
                ${car.COMPANY || ''} · ${car.COLOR || ''} · ${car.SEATINGCAPACITY || 5} seats
                ${car.PLATENUMBER ? '<br>Plate: ' + car.PLATENUMBER : ''}
            </div>
            <div class="car-rate">$${car.DAILYRATE || 0}/day</div>
            <div class="car-actions">
                <button class="btn-view" onclick="router.navigate('/car/${car.ID}')">View Details</button>
                <button class="btn-book" ${!isAvailable ? 'disabled' : ''} onclick="bookCarFromList(${car.ID})" ${!isAvailable ? 'title="Car is not available"' : ''}>
                    ${isAvailable ? 'Book Now' : 'Unavailable'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

function bookCarFromList(carId) {
    const token = localStorage.getItem('urbanride_token');
    if (!token) {
        alert('Please login first to book a car.');
        if (window.openAuth) {
            window.openAuth('login');
        }
        return;
    }
        // Navigate to home and scroll to booking
    router.navigate('/booking'); 
    
    // Pre-select vehicle if booking form exists (simple implementation)
}

window.bookCarFromList = bookCarFromList;

async function showCarDetailsPage(carId) {
    const container = document.getElementById('main-content');
    if (!container) return;
    
    // Hide home content
    const homeContent = document.getElementById('home-content');
    if (homeContent) {
        homeContent.style.display = 'none';
    }
    
    // Remove any existing dynamic content
    const existingDynamic = container.querySelectorAll('.about-page, .cars-page, .car-details-page, .fleet-page');
    existingDynamic.forEach(el => el.remove());
    
    const detailsDiv = document.createElement('div');
    detailsDiv.innerHTML = `
        <section class="car-details-page">
            <div class="container">
                <div class="car-details-header">
                    <a href="javascript:history.back()" class="back-link">← Back to Cars</a>
                </div>
                <div id="carDetailsContainer" class="loading">
                    <p>Loading car details...</p>
                </div>
            </div>
        </section>
    `;
    
    container.appendChild(detailsDiv.firstElementChild);
    window.scrollTo(0, 0);
    
    // Load car details
    try {
        const res = await fetch(`${API_BASE}/api/cars/${carId}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load car details');
        }

        const car = data.car;
        const maintenanceHistory = data.maintenanceHistory || [];
        const damageHistory = data.damageHistory || [];
        const upcomingReservations = data.upcomingReservations || [];

        const isAvailable = car.STATUS === 'AVAILABLE';
        const container = document.getElementById('carDetailsContainer');

        container.innerHTML = `
            <div class="car-details-grid">
                <div class="car-image-large">🚗</div>
                <div class="car-info">
                    <h1 class="car-title">${car.DESCRIPTION || 'Vehicle ' + car.ID}</h1>
                    <p class="car-subtitle">${car.COMPANY || ''} · ${car.MODEL || ''} ${car.YEAR || ''}</p>
                    <div class="car-price">$${car.DAILYRATE || 0}/day</div>
                    
                    <div class="info-grid">
                        <div class="info-item">
                            <div class="info-label">Category</div>
                            <div class="info-value">${car.CATEGORY || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Color</div>
                            <div class="info-value">${car.COLOR || 'N/A'}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Seating Capacity</div>
                            <div class="info-value">${car.SEATINGCAPACITY || 5} seats</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Mileage</div>
                            <div class="info-value">${car.CURRENTMILEAGE ? car.CURRENTMILEAGE.toLocaleString() : 0} km</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Status</div>
                            <div class="info-value">${car.STATUSLABEL || car.STATUS}</div>
                        </div>
                        <div class="info-item">
                            <div class="info-label">Plate Number</div>
                            <div class="info-value">${car.PLATENUMBER || 'N/A'}</div>
                        </div>
                    </div>

                    <h3 style="margin-top: 30px; margin-bottom: 15px;">Features</h3>
                    <ul class="features-list">
                        <li>Air Conditioning</li>
                        <li>GPS Navigation</li>
                        <li>Airbags</li>
                        <li>${car.CATEGORY === 'LUXURY' ? 'Premium Sound System' : 'Standard Audio'}</li>
                        <li>${car.SEATINGCAPACITY >= 7 ? 'Third Row Seating' : 'Comfortable Seating'}</li>
                        <li>Bluetooth Connectivity</li>
                        <li>USB Charging Ports</li>
                    </ul>

                    ${car.LASTSERVICEDATE ? `
                        <div class="info-item" style="margin-top: 20px;">
                            <div class="info-label">Last Service Date</div>
                            <div class="info-value">${new Date(car.LASTSERVICEDATE).toLocaleDateString()}</div>
                        </div>
                    ` : ''}

                    <button class="btn-book-large" ${!isAvailable ? 'disabled' : ''} onclick="bookCarFromList(${car.ID})" ${!isAvailable ? 'title="Car is not available"' : ''}>
                        ${isAvailable ? 'Book This Car' : 'Car Not Available'}
                    </button>
                </div>
            </div>

            ${maintenanceHistory.length > 0 ? `
                <div class="maintenance-section">
                    <h2 class="section-title">Maintenance History (Transparency Feature)</h2>
                    <p style="color: #CFD0D8; margin-bottom: 20px;">
                        We believe in transparency. Here's the complete maintenance history of this vehicle:
                    </p>
                    ${maintenanceHistory.map(m => `
                        <div class="maintenance-item">
                            <div class="maintenance-date">${new Date(m.MAINTENANCEDATE).toLocaleDateString()}</div>
                            <div class="maintenance-desc">${m.DESCRIPTION || 'Maintenance service'}</div>
                            <div class="maintenance-cost">Cost: $${m.COST || 0}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}

            ${upcomingReservations.length > 0 ? `
                <div class="maintenance-section">
                    <h2 class="section-title">Upcoming Reservations</h2>
                    ${upcomingReservations.map(r => `
                        <div class="maintenance-item">
                            <div class="maintenance-date">
                                ${new Date(r.RENT_STARTDATE).toLocaleDateString()} - ${new Date(r.RENT_ENDDATE).toLocaleDateString()}
                            </div>
                            <div class="maintenance-desc">Status: ${r.STATUS}</div>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        `;
    } catch (err) {
        console.error(err);
        const container = document.getElementById('carDetailsContainer');
        if (container) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Error loading car details: ${err.message}</p>
                    <p>Please try again later.</p>
                </div>
            `;
        }
    }
}

// Make router globally available
window.router = router;
