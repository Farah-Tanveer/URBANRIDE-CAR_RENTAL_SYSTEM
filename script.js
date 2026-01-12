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

// ===== Form Validation & Search Functionality =====
const searchButton = document.querySelector('.btn-search');
if (searchButton) {
    searchButton.addEventListener('click', (e) => {
        e.preventDefault();
        const pickupLocation = document.getElementById('pickup-location').value;
        const dropoffLocation = document.getElementById('dropoff-location').value;
        const pickupDateValue = document.getElementById('pickup-date').value;
        const dropoffDateValue = document.getElementById('dropoff-date').value;

        if (!pickupLocation || !dropoffLocation || !pickupDateValue || !dropoffDateValue) {
            alert('Please fill in all fields');
            return;
        }

        if (new Date(dropoffDateValue) <= new Date(pickupDateValue)) {
            alert('Drop-off date must be after pickup date');
            return;
        }

        // Here you would typically send this data to your backend
        console.log('Search initiated:', {
            pickupLocation,
            dropoffLocation,
            pickupDate: pickupDateValue,
            dropoffDate: dropoffDateValue
        });

        // Show success message
        searchButton.textContent = 'Searching...';
        searchButton.style.opacity = '0.7';
        
        setTimeout(() => {
            alert('Search completed! Redirecting to fleet selection...');
            searchButton.textContent = 'Search Cars';
            searchButton.style.opacity = '1';
        }, 1000);
    });
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
