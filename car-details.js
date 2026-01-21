// Car Details Page Script
const API_BASE = window.API_BASE || 'http://localhost:4001';

// Map car details to image path (same logic as router.js)
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

// Get car ID from URL
function getCarIdFromURL() {
    const path = window.location.pathname;
    const match = path.match(/\/car\/(\d+)/);
    return match ? parseInt(match[1]) : null;
}

// Load car details
async function loadCarDetails() {
    const carId = getCarIdFromURL();
    if (!carId) {
        document.getElementById('carDetailsContainer').innerHTML = '<div class="empty-state"><p>Invalid car ID</p></div>';
        return;
    }

    const container = document.getElementById('carDetailsContainer');

    try {
        container.innerHTML = '<div class="loading"><p>Loading car details...</p></div>';
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

        container.innerHTML = `
            <div class="car-details-grid">
                <div class="car-image-large"><img src="${getCarImagePath(car)}" alt="${car.DESCRIPTION || 'Vehicle ' + car.ID}"></div>
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

                    <button class="btn-book-large" ${!isAvailable ? 'disabled' : ''} onclick="bookThisCar(${car.ID})" ${!isAvailable ? 'title="Car is not available"' : ''}>
                        ${isAvailable ? 'Book This Car' : 'Car Not Available'}
                    </button>
                </div>
            </div>

            ${maintenanceHistory.length > 0 ? `
                <div class="maintenance-section">
                    <h2 class="section-title">Maintenance History (Transparency Feature)</h2>
                    <p style="color: #666; margin-bottom: 20px;">
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
        container.innerHTML = `
            <div class="empty-state">
                <p>Error loading car details: ${err.message}</p>
                <p>Please try again later.</p>
            </div>
        `;
    }
}

// Book this car
function bookThisCar(carId) {
    const token = localStorage.getItem('urbanride_token');
    // If already logged in, do not prompt, proceed to booking
    if (token) {
        window.location.href = `/#booking?car=${carId}`;
        return;
    }
    // If not logged in, open auth modal for login (no page redirect)
    if (window.openAuth) {
        window.openAuth('login');
    } else {
        alert('Please login first to book this car.');
    }
}

// Initialize page
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCarDetails);
} else {
    loadCarDetails();
}
