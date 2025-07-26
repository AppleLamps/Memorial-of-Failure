document.addEventListener('DOMContentLoaded', async function() {
    // Initialize audio
    initializeAudio();
    
    const memorialGrid = document.getElementById('memorial-grid');
    
    // Show loading state
    memorialGrid.innerHTML = '<div class="loading">Loading memorial data...</div>';
    
    try {
        // Load the JSON data
        const response = await fetch('fired.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const people = await response.json();
        
        // Clear loading state
        memorialGrid.innerHTML = '';
        
        // Create cards for each person
        people.forEach((person, index) => {
            const card = createMemorialCard(person, index);
            memorialGrid.appendChild(card);
        });
        
        // Add staggered animation
        const cards = document.querySelectorAll('.memorial-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.1}s`;
        });
        
    } catch (error) {
        console.error('Error loading memorial data:', error);
        memorialGrid.innerHTML = `
            <div class="loading" style="color: #e74c3c;">
                Failed to load memorial data. Please check that fired.json exists.
            </div>
        `;
    }
});

function createMemorialCard(person, index) {
    const card = document.createElement('div');
    card.className = 'memorial-card';
    
    // Get initials for placeholder
    const initials = getInitials(person.Name);
    
    // Determine if photo exists
    const hasPhoto = person.photo_link && person.photo_link !== 'placeholder.jpg';
    
    // Create photo section
    const photoSection = hasPhoto 
        ? `<img src="${person.photo_link}" alt="${person.Name}" onerror="this.parentElement.innerHTML = createPlaceholder('${initials}')">`
        : createPlaceholder(initials);
    
    card.innerHTML = `
        <div class="card-photo">
            ${photoSection}
        </div>
        <div class="card-content">
            <h3 class="card-name">${person.Name || 'Unknown'}</h3>
            <div class="card-details">
                <div class="card-role">${person['Job/Role'] || 'Position not specified'}</div>
                <div class="card-publication">Now at: ${person['Publication / New Role'] || 'Not specified'}</div>
                <div class="card-date">Announced: ${formatDate(person['Announced Date']) || 'Date not available'}</div>
            </div>
        </div>
    `;
    
    return card;
}

function createPlaceholder(initials) {
    return `<div class="placeholder-photo">${initials}</div>`;
}

function getInitials(name) {
    if (!name) return '?';
    
    const nameParts = name.split(' ');
    if (nameParts.length >= 2) {
        return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
    } else {
        return name.charAt(0).toUpperCase();
    }
}

function formatDate(dateString) {
    if (!dateString || dateString === '-') return 'Date not available';
    
    try {
        // Handle various date formats
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) {
            // If it's not a valid date, return as-is
            return dateString;
        }
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    } catch (error) {
        return dateString;
    }
}

// Smooth scrolling for any internal links
document.addEventListener('click', function(e) {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
            targetElement.scrollIntoView({
                behavior: 'smooth'
            });
        }
    }
});

// Add scroll indicator functionality
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.addEventListener('click', function() {
        const mainContent = document.querySelector('.main-content');
        mainContent.scrollIntoView({
            behavior: 'smooth'
        });
    });
}

// Lazy loading optimization for images
function setupLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading after content is loaded
setTimeout(setupLazyLoading, 1000);

// Audio functionality
function initializeAudio() {
    const audio = document.getElementById('background-audio');
    const audioToggle = document.getElementById('audio-toggle');
    let isPlaying = false;
    let userInteracted = false;

    if (!audio || !audioToggle) return;

    // Function to play audio
    function playAudio() {
        if (userInteracted && !isPlaying) {
            audio.play().then(() => {
                isPlaying = true;
                audioToggle.classList.remove('muted');
            }).catch(error => {
                console.log('Audio play failed:', error);
            });
        }
    }

    // Function to pause audio
    function pauseAudio() {
        audio.pause();
        isPlaying = false;
        audioToggle.classList.add('muted');
    }

    // Audio toggle functionality
    audioToggle.addEventListener('click', function() {
        userInteracted = true;
        
        if (isPlaying) {
            pauseAudio();
        } else {
            playAudio();
        }
    });

    // Auto-play on first user interaction (required by browsers)
    function handleFirstInteraction() {
        userInteracted = true;
        playAudio();
        
        // Remove event listeners after first interaction
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
        document.removeEventListener('touchstart', handleFirstInteraction);
    }

    // Wait for user interaction before playing
    document.addEventListener('click', handleFirstInteraction);
    document.addEventListener('keydown', handleFirstInteraction);
    document.addEventListener('touchstart', handleFirstInteraction);

    // Handle audio events
    audio.addEventListener('play', function() {
        isPlaying = true;
        audioToggle.classList.remove('muted');
    });

    audio.addEventListener('pause', function() {
        isPlaying = false;
        audioToggle.classList.add('muted');
    });

    audio.addEventListener('ended', function() {
        isPlaying = false;
        audioToggle.classList.add('muted');
    });

    // Set initial volume
    audio.volume = 0.3;

    // Start muted initially
    audioToggle.classList.add('muted');
} 