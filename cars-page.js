// Cars Category Page Script
const API_BASE = window.API_BASE || 'http://localhost:4001';

// Get category from URL
function getCategoryFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/cars\/(\w+)/);
    return match ? match[1].toLowerCase() : null;
}

// Load cars by category
async function loadCarsByCategory() {
    const category = getCategoryFromURL();
    if (!category) {
        document.getElementById('carsContainer').innerHTML = '<div class="empty-state"><p>Invalid category</p></div>';
        return;
    }

    const categoryTitle = document.getElementById('categoryTitle');
    const categoryDescription = document.getElementById('categoryDescription');
    const container = document.getElementById('carsContainer');

    // Set category title
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

    categoryTitle.textContent = categoryNames[category] || 'Cars';
    categoryDescription.textContent = categoryDescs[category] || '';

    try {
        container.innerHTML = '<div class="loading"><p>Loading cars...</p></div>';
        const res = await fetch(`${API_BASE}/api/cars/category/${category}`);
        const data = await res.json();

        if (!res.ok) {
            throw new Error(data.error || 'Failed to load cars');
        }

        const cars = data.items || [];
        
        if (cars.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No ${category} cars available at the moment.</p>
                    <p>Please check back later or browse other categories.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = '<div class="cars-grid"></div>';
        const grid = container.querySelector('.cars-grid');

        cars.forEach(car => {
            const card = createCarCard(car);
            grid.appendChild(card);
        });
    } catch (err) {
        console.warn('Backend unavailable, loading offline demo cars.', err);
        const mockCars = [
            // ECONOMY (6+)
            { ID: 101, DESCRIPTION: 'Toyota Corolla', COMPANY: 'Toyota', MODEL: 'Corolla', YEAR: 2020, DAILYRATE: 45, CATEGORY: 'ECONOMY', COLOR: 'White', SEATINGCAPACITY: 5, CURRENTMILEAGE: 32000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'ABC-123' },
            { ID: 102, DESCRIPTION: 'Ford Fiesta', COMPANY: 'Ford', MODEL: 'Fiesta', YEAR: 2019, DAILYRATE: 40, CATEGORY: 'ECONOMY', COLOR: 'Blue', SEATINGCAPACITY: 5, CURRENTMILEAGE: 41000, STATUS: 'MAINTENANCE', STATUSLABEL: 'Maintenance', PLATENUMBER: 'XYZ-456' },
            { ID: 103, DESCRIPTION: 'Suzuki Swift', COMPANY: 'Suzuki', MODEL: 'Swift', YEAR: 2018, DAILYRATE: 38, CATEGORY: 'ECONOMY', COLOR: 'Red', SEATINGCAPACITY: 5, CURRENTMILEAGE: 50000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'ABC-789' },
            { ID: 104, DESCRIPTION: 'Nissan Sunny', COMPANY: 'Nissan', MODEL: 'Sunny', YEAR: 2017, DAILYRATE: 36, CATEGORY: 'ECONOMY', COLOR: 'Silver', SEATINGCAPACITY: 5, CURRENTMILEAGE: 60000, STATUS: 'RESERVED', STATUSLABEL: 'Reserved', PLATENUMBER: 'ECO-104' },
            { ID: 105, DESCRIPTION: 'Hyundai Accent', COMPANY: 'Hyundai', MODEL: 'Accent', YEAR: 2019, DAILYRATE: 39, CATEGORY: 'ECONOMY', COLOR: 'Grey', SEATINGCAPACITY: 5, CURRENTMILEAGE: 45000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'ECO-105' },
            { ID: 106, DESCRIPTION: 'Honda City', COMPANY: 'Honda', MODEL: 'City', YEAR: 2020, DAILYRATE: 44, CATEGORY: 'ECONOMY', COLOR: 'Black', SEATINGCAPACITY: 5, CURRENTMILEAGE: 35000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'ECO-106' },
            // SUV (6+)
            { ID: 201, DESCRIPTION: 'Honda CR-V', COMPANY: 'Honda', MODEL: 'CR-V', YEAR: 2021, DAILYRATE: 70, CATEGORY: 'SUV', COLOR: 'Black', SEATINGCAPACITY: 5, CURRENTMILEAGE: 22000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'SUV-001' },
            { ID: 202, DESCRIPTION: 'Hyundai Tucson', COMPANY: 'Hyundai', MODEL: 'Tucson', YEAR: 2020, DAILYRATE: 68, CATEGORY: 'SUV', COLOR: 'Silver', SEATINGCAPACITY: 5, CURRENTMILEAGE: 28000, STATUS: 'RESERVED', STATUSLABEL: 'Reserved', PLATENUMBER: 'SUV-002' },
            { ID: 203, DESCRIPTION: 'Ford Escape', COMPANY: 'Ford', MODEL: 'Escape', YEAR: 2020, DAILYRATE: 65, CATEGORY: 'SUV', COLOR: 'Green', SEATINGCAPACITY: 5, CURRENTMILEAGE: 30000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'SUV-003' },
            { ID: 204, DESCRIPTION: 'Toyota RAV4', COMPANY: 'Toyota', MODEL: 'RAV4', YEAR: 2019, DAILYRATE: 72, CATEGORY: 'SUV', COLOR: 'White', SEATINGCAPACITY: 5, CURRENTMILEAGE: 27000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'SUV-004' },
            { ID: 205, DESCRIPTION: 'Kia Sportage', COMPANY: 'Kia', MODEL: 'Sportage', YEAR: 2020, DAILYRATE: 69, CATEGORY: 'SUV', COLOR: 'Red', SEATINGCAPACITY: 5, CURRENTMILEAGE: 25000, STATUS: 'MAINTENANCE', STATUSLABEL: 'Maintenance', PLATENUMBER: 'SUV-005' },
            { ID: 206, DESCRIPTION: 'Nissan X-Trail', COMPANY: 'Nissan', MODEL: 'X-Trail', YEAR: 2018, DAILYRATE: 64, CATEGORY: 'SUV', COLOR: 'Blue', SEATINGCAPACITY: 5, CURRENTMILEAGE: 40000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'SUV-006' },
            // LUXURY (6+)
            { ID: 301, DESCRIPTION: 'BMW 3 Series', COMPANY: 'BMW', MODEL: '3 Series', YEAR: 2022, DAILYRATE: 120, CATEGORY: 'LUXURY', COLOR: 'Gray', SEATINGCAPACITY: 5, CURRENTMILEAGE: 8000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'LUX-100' },
            { ID: 302, DESCRIPTION: 'Mercedes C-Class', COMPANY: 'Mercedes', MODEL: 'C-Class', YEAR: 2021, DAILYRATE: 130, CATEGORY: 'LUXURY', COLOR: 'White', SEATINGCAPACITY: 5, CURRENTMILEAGE: 15000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'LUX-101' },
            { ID: 303, DESCRIPTION: 'Audi A4', COMPANY: 'Audi', MODEL: 'A4', YEAR: 2021, DAILYRATE: 115, CATEGORY: 'LUXURY', COLOR: 'Blue', SEATINGCAPACITY: 5, CURRENTMILEAGE: 12000, STATUS: 'MAINTENANCE', STATUSLABEL: 'Maintenance', PLATENUMBER: 'LUX-102' },
            { ID: 304, DESCRIPTION: 'BMW 5 Series', COMPANY: 'BMW', MODEL: '5 Series', YEAR: 2021, DAILYRATE: 140, CATEGORY: 'LUXURY', COLOR: 'Black', SEATINGCAPACITY: 5, CURRENTMILEAGE: 16000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'LUX-103' },
            { ID: 305, DESCRIPTION: 'Mercedes E-Class', COMPANY: 'Mercedes', MODEL: 'E-Class', YEAR: 2020, DAILYRATE: 150, CATEGORY: 'LUXURY', COLOR: 'Silver', SEATINGCAPACITY: 5, CURRENTMILEAGE: 20000, STATUS: 'RESERVED', STATUSLABEL: 'Reserved', PLATENUMBER: 'LUX-104' },
            { ID: 306, DESCRIPTION: 'Audi A6', COMPANY: 'Audi', MODEL: 'A6', YEAR: 2019, DAILYRATE: 135, CATEGORY: 'LUXURY', COLOR: 'White', SEATINGCAPACITY: 5, CURRENTMILEAGE: 23000, STATUS: 'AVAILABLE', STATUSLABEL: 'Available', PLATENUMBER: 'LUX-105' }
        ];
        const cars = mockCars.filter(c => (c.CATEGORY || '').toLowerCase() === category);
        if (cars.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No ${category} cars available in offline mode.</p>
                    <p>Try another category.</p>
                </div>
            `;
            return;
        }
        container.innerHTML = '<div class="cars-grid"></div>';
        const grid = container.querySelector('.cars-grid');
        cars.forEach(car => {
            const card = createCarCard(car);
            grid.appendChild(card);
        });
    }
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading cars: ${err.message}</p>
                <p>Please try again later.</p>
            </div>
        `;
    }


// Create car card element
function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    const statusClass = car.STATUS === 'AVAILABLE' ? 'status-available' : 
                       car.STATUS === 'RESERVED' ? 'status-reserved' : 'status-maintenance';
    const statusText = car.STATUSLABEL || car.STATUS;
    const isAvailable = car.STATUS === 'AVAILABLE';
    
    card.innerHTML = `
        <div class="car-image"><img src="${getCarImagePath(car)}" alt="${car.DESCRIPTION || 'Vehicle ' + car.ID}"></div>
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
                <button class="btn-view" onclick="viewCarDetails(${car.ID})">View Details</button>
                <button class="btn-book" ${!isAvailable ? 'disabled' : ''} onclick="bookCar(${car.ID})" ${!isAvailable ? 'title="Car is not available"' : ''}>
                    ${isAvailable ? 'Book Now' : 'Unavailable'}
                </button>
            </div>
        </div>
    `;
    
    return card;
}

// View car details
function viewCarDetails(carId) {
    window.location.href = `/car/${carId}`;
}

// Book car (redirects to booking with car pre-selected)
function bookCar(carId) {
    const token = localStorage.getItem('urbanride_token');
    if (!token) {
        alert('Please login first to book a car.');
        // Open auth modal if available
        if (window.openAuth) {
            window.openAuth('login');
        } else {
            window.location.href = '/#login';
        }
        return;
    }
    // Redirect to home booking section with car pre-selected
    window.location.href = `/#booking?car=${carId}`;
}

// Initialize page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCarsByCategory);
} else {
    loadCarsByCategory();
}

function getCarImagePath(car) {
  const desc = (car.DESCRIPTION || '').toLowerCase();
  const company = (car.COMPANY || '').toLowerCase();
  const model = (car.MODEL || '').toLowerCase();
  if (desc.includes('honda city') || model.includes('city')) return 'Images/honda_city.jpg';
  if (desc.includes('toyota corolla') || model.includes('corolla')) return 'Images/toyota_corola.jpg';
  if (desc.includes('suzuki swift') || model.includes('swift')) return 'Images/susuk_iswift_altomehran.jpg';
  if (desc.includes('nissan sunny') || model.includes('sunny')) return 'Images/nissan_sunny.jpg';
  if (desc.includes('ford fiesta') || model.includes('fiesta')) return 'Images/ford_fiesta.jpg';
  if (desc.includes('hyundai accent') || model.includes('accent')) return 'Images/hyundai_ascent.jpg';
  if (desc.includes('hyundai tucson') || model.includes('tucson')) return 'Images/hyundai_tucson.jpg';
  if (desc.includes('rav4') || model.includes('rav4')) return 'Images/toyota_rav4.jpg';
  if (desc.includes('sportage') || model.includes('sportage')) return 'Images/kia_sportage.jpg';
  if (desc.includes('x-trail') || desc.includes('xtrail') || model.includes('x-trail') || model.includes('xtrail')) return 'Images/nissan_xtrail.jpg';
  if (desc.includes('escape') || model.includes('escape')) return 'Images/ford_escape.jpg';
  if (desc.includes('cr-v') || model.includes('cr-v') || model.includes('crv')) return 'Images/honda_crv.jpg';
  if (desc.includes('bmw 3') || model.includes('3 series')) return 'Images/bmw_m3_series.jpg';
  if (desc.includes('bmw 5') || model.includes('5 series')) return 'Images/m5.jpg';
  if (desc.includes('c-class') || model.includes('c-class')) return 'Images/mersidies_cclass.jpg';
  if (desc.includes('e-class') || model.includes('e-class')) return 'Images/mercidies_eclass.jpg';
  if (desc.includes('audi a4') || model.includes('a4')) return 'Images/audi_a4.jpg';
  if (desc.includes('audi a6') || model.includes('a6')) return 'Images/audi_a6.jpg';
  return 'Images/kia_sportage.jpg';
}
