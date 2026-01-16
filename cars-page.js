// Cars Category Page Script
const API_BASE = 'http://localhost:4000';

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
        console.error(err);
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading cars: ${err.message}</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
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
