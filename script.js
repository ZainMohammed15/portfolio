/* ========== SCROLL PROGRESS BAR ========== */
window.addEventListener('scroll', () => {
  const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
  const progressBar = document.querySelector('.scroll-progress');
  if (progressBar) {
    progressBar.style.width = scrollPercentage + '%';
  }
});

/* ========= CLEAN FLOATING QUOTES (NO OVERLAP) ========= */

const cleanQuotes = [
    "Chai first, problems later.",
    "Slow progress is still progress.",
    "Life is a safar (journey).",
    "Still figuring it out.",
    "Every mistake is a lesson wrapped in chai (tea).",
    "Growing at my own pace.",
    "Patience is everything."
];

function showFloatingQuote() {
    const containers = document.querySelectorAll('.floating-quote-container');
    if (!containers.length) return;

    containers.forEach(container => {
        const quoteBox = container.querySelector(".floating-quote");

        // Pick a random quote
        const q = cleanQuotes[Math.floor(Math.random() * cleanQuotes.length)];

        // Set quote
        quoteBox.textContent = `"${q}"`;

        // fade in
        setTimeout(() => {
            quoteBox.style.opacity = "1";
        }, 200);

        // fade out before user reaches next section
        setTimeout(() => {
            quoteBox.style.opacity = "0";
        }, 5000);
    });
}

// Show quote ONLY when container enters view
const quoteObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            showFloatingQuote();
        }
    });
}, { threshold: 0.8 });

document.querySelectorAll('.floating-quote-container')
    .forEach(c => quoteObserver.observe(c));

/* ========== POPUP MANAGEMENT ========== */
const popups = {
  welcome: document.getElementById('welcomePopup'),
  scroll: document.getElementById('scrollPopup'),
  ai: document.getElementById('aiPopup'),
  end: document.getElementById('endPopup'),
  story: document.getElementById('storyPopup')
};

// Popup frequency control helpers
function setPopupViewed(popupId, frequency = 'visitor') {
  const timestamp = new Date().getTime();
  
  if (frequency === 'visitor') {
    localStorage.setItem(`popup_${popupId}_viewed`, 'true');
  } else if (frequency === 'session') {
    sessionStorage.setItem(`popup_${popupId}_viewed`, 'true');
  } else if (frequency === 'day') {
    localStorage.setItem(`popup_${popupId}_timestamp`, timestamp.toString());
  }
}

function hasPopupBeenViewed(popupId, frequency = 'visitor') {
  if (frequency === 'visitor') {
    return localStorage.getItem(`popup_${popupId}_viewed`) === 'true';
  } else if (frequency === 'session') {
    return sessionStorage.getItem(`popup_${popupId}_viewed`) === 'true';
  } else if (frequency === 'day') {
    const timestamp = localStorage.getItem(`popup_${popupId}_timestamp`);
    if (!timestamp) return false;
    
    const lastShown = parseInt(timestamp, 10);
    const now = new Date().getTime();
    const oneDay = 24 * 60 * 60 * 1000;
    
    return (now - lastShown) < oneDay;
  }
  
  return false;
}

function closePopup(popupId) {
  if (popups[popupId]) {
    popups[popupId].classList.remove('active');
  }
}

function openPopup(popupId, frequency = null) {
  if (popups[popupId]) {
    // Check frequency control
    if (frequency && hasPopupBeenViewed(popupId, frequency)) {
      return;
    }
    
    popups[popupId].classList.add('active');
    
    // Mark as viewed if frequency is specified
    if (frequency) {
      setPopupViewed(popupId, frequency);
    }
  }
}

// Close popup listeners
Object.keys(popups).forEach(key => {
  if (popups[key]) {
    const closeBtn = popups[key].querySelector('.popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => closePopup(key));
    }

    popups[key].addEventListener('click', (e) => {
      if (e.target === popups[key]) {
        closePopup(key);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && popups[key].classList.contains('active')) {
        closePopup(key);
      }
    });
  }
});

document.querySelectorAll('.popup-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const popup = btn.closest('.popup');
    if (popup) {
      popup.classList.remove('active');
    }
  });
});

/* ========== WELCOME & PAGE POPUPS ========== */
window.addEventListener('load', () => {
  // Welcome popup - once per visitor (localStorage)
  if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
    setTimeout(() => {
      openPopup('welcome', 'visitor');
    }, 800);
  }
  
  // Story popup - once per page load (no frequency, just on about.html)
  if (window.location.pathname.includes('about.html')) {
    setTimeout(() => {
      // Don't use frequency control for story - let it show on each visit
      // But we still prevent duplicate opens within same load
      if (!sessionStorage.getItem('story_popup_shown_this_load')) {
        openPopup('story');
        sessionStorage.setItem('story_popup_shown_this_load', 'true');
      }
    }, 800);
  }
  
  // Skills popup - once per page load (no frequency, just on skills.html)
  if (window.location.pathname.includes('skills.html')) {
    setTimeout(() => {
      openPopup('ai');
    }, 1000);
  }
});

/* ========== SCROLL POPUP (70%) ========== */
window.addEventListener('scroll', () => {
  // Once per session (sessionStorage)
  if (hasPopupBeenViewed('scroll', 'session')) return;

  const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

  if (scrollPercentage >= 70) {
    openPopup('scroll', 'session');
  }
});

/* ========== END POPUP (About page) ========== */
window.addEventListener('scroll', () => {
  if (window.location.pathname.includes('about.html')) {
    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    
    if (scrollPercentage >= 95 && popups.end && !popups.end.classList.contains('active')) {
      openPopup('end');
    }
  }
});

/* ========== CHAI MODE ========== */
const chaiButton = document.querySelector('.chai-button');
let chaiModeActive = false;

function toggleChaiMode() {
  chaiModeActive = !chaiModeActive;
  
  if (chaiModeActive) {
    // Activate chai mode
    document.body.classList.add('chai-mode-active');
    
    // Show message
    const message = document.createElement('div');
    message.className = 'chai-message';
    message.textContent = '☕ Chai Break Activated. Take a moment.';
    document.body.appendChild(message);
    
    // Show steam animation
    const steam = document.querySelector('.chai-steam');
    if (steam) steam.style.opacity = '1';
    
    // Remove message after 3 seconds
    setTimeout(() => {
      message.style.animation = 'fadeInUp 0.5s ease-out reverse';
      setTimeout(() => message.remove(), 500);
    }, 3000);
  } else {
    // Deactivate chai mode
    document.body.classList.remove('chai-mode-active');
    const steam = document.querySelector('.chai-steam');
    if (steam) steam.style.opacity = '0';
  }
}

if (chaiButton) {
  chaiButton.addEventListener('click', toggleChaiMode);
}

/* ========== HAMBURGER MENU ========== */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

/* ========== ACTIVE NAV LINK ========== */
function setActiveNavLink() {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

setActiveNavLink();

/* ========== TIMELINE ANIMATION ========== */
function animateTimeline() {
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.5 });

  timelineItems.forEach(item => {
    observer.observe(item);
  });
}

if (window.location.pathname.includes('skills.html')) {
  animateTimeline();
}

/* ========== GALLERY CAROUSEL (Mobile) ========== */
function initGalleryCarousel() {
  const stripGallery = document.querySelector('.strip-gallery');
  
  if (!stripGallery) return;

  let startX = 0;
  let endX = 0;

  stripGallery.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].screenX;
  }, false);

  stripGallery.addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);

  function handleSwipe() {
    if (startX > endX + 50) {
      stripGallery.scrollLeft += 200;
    } else if (startX < endX - 50) {
      stripGallery.scrollLeft -= 200;
    }
  }
}

initGalleryCarousel();

/* ========== SMOOTH SCROLL FOR ANCHOR LINKS ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#' && document.querySelector(href)) {
      e.preventDefault();
      document.querySelector(href).scrollIntoView({ behavior: 'smooth' });
    }
  });
});

/* ========== LAZY LOAD IMAGES ========== */
function lazyLoadImages() {
  const images = document.querySelectorAll('img[data-src]');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        observer.unobserve(img);
      }
    });
  });

  images.forEach(img => observer.observe(img));
}

lazyLoadImages();

/* ========== PARALLAX EFFECT (Subtle) ========== */
function parallaxScroll() {
  const parallaxElements = document.querySelectorAll('[data-parallax]');
  
  window.addEventListener('scroll', () => {
    parallaxElements.forEach(element => {
      const scrollPosition = window.scrollY;
      const yPos = scrollPosition * 0.5;
      element.style.transform = `translateY(${yPos}px)`;
    });
  });
}

if (document.querySelectorAll('[data-parallax]').length > 0) {
  parallaxScroll();
}

/* ========== GLOW EFFECT ON HOVER ========== */
function setupGlowEffect() {
  const glowElements = document.querySelectorAll('.interest-card, .brings-card, .skill-category, .gallery-item, .built-item, .win-item');
  
  glowElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      element.style.setProperty('--glow-x', `${x}px`);
      element.style.setProperty('--glow-y', `${y}px`);
    });
  });
}

setupGlowEffect();

/* ========== EASTER EGGS ========== */
// Console message
console.log('%c🌍 Between Two Worlds', 'color: #D4A75C; font-size: 18px; font-weight: bold;');
console.log('%cGlasgow 🏴󠁧󠁢󠁳󠁣󠁴󠁿 | Pakistan 🇵🇰 | AI Enthusiast 🤖', 'color: #6A4E3B; font-size: 12px;');
console.log('%cIf you\'re reading this, you\'re a legend. Chai (tea) is on us. ☕', 'color: #D4A75C; font-size: 11px; font-style: italic;');

// Python easter egg
document.querySelectorAll('.skill-category').forEach(category => {
  const title = category.querySelector('h3');
  if (title && title.textContent.includes('Programming')) {
    category.addEventListener('mouseenter', function() {
      const items = this.querySelectorAll('li');
      items.forEach(item => {
        if (item.textContent.includes('Python')) {
          const originalText = item.textContent;
          item.title = 'Emotional support language';
          item.style.cursor = 'help';
          item.addEventListener('click', () => {
            alert('🐍 Python: Making developers question their life choices, one indentation error at a time.');
          });
        }
      });
    });
  }
});

/* ========== PAGE TRANSITION ========== */
window.addEventListener('beforeunload', () => {
  document.body.style.opacity = '0.95';
});

window.addEventListener('load', () => {
  document.body.style.transition = 'opacity 0.3s ease-out';
  document.body.style.opacity = '1';
});

/* ========== ACCESSIBILITY: FOCUS STYLES ========== */
document.querySelectorAll('a, button').forEach(element => {
  element.addEventListener('focus', function() {
    this.style.outline = `2px solid #D4A75C`;
    this.style.outlineOffset = '2px';
  });
  
  element.addEventListener('blur', function() {
    this.style.outline = 'none';
  });
});

/* ========== NIGHT MODE TOGGLE ========== */
const nightModeToggle = document.getElementById('nightModeToggle');
const html = document.documentElement;

// Check for saved night mode preference
const isDarkMode = localStorage.getItem('nightMode') === 'enabled';
if (isDarkMode) {
  html.classList.add('night-mode');
}

if (nightModeToggle) {
  nightModeToggle.addEventListener('click', () => {
    html.classList.toggle('night-mode');
    const isNowDark = html.classList.contains('night-mode');
    localStorage.setItem('nightMode', isNowDark ? 'enabled' : 'disabled');
    
    // Animate the toggle
    nightModeToggle.style.transform = 'rotate(360deg)';
    setTimeout(() => {
      nightModeToggle.style.transform = 'rotate(0)';
    }, 600);
  });
}

/* ========== LIGHTBOX GALLERY ========== */
function initLightbox() {
  const lightboxItems = document.querySelectorAll('[data-lightbox]');
  const lightbox = document.getElementById('lightboxModal');
  const lightboxImage = document.getElementById('lightboxImage');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxPrev = document.querySelector('.lightbox-prev');
  const lightboxNext = document.querySelector('.lightbox-next');
  
  if (!lightbox || lightboxItems.length === 0) return;

  let currentIndex = 0;
  const images = Array.from(lightboxItems);

  function openLightbox(index) {
    currentIndex = index;
    const item = images[index];
    const img = item.querySelector('img');
    const caption = item.querySelector('.gallery-caption');
    
    lightboxImage.src = img.src;
    lightboxCaption.textContent = caption ? caption.textContent : '';
    lightbox.classList.add('active');
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % images.length;
    openLightbox(currentIndex);
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    openLightbox(currentIndex);
  }

  lightboxItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevImage);
  if (lightboxNext) lightboxNext.addEventListener('click', nextImage);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevImage();
    if (e.key === 'ArrowRight') nextImage();
  });
}

initLightbox();

/* ========== CHAI LOADING ANIMATION ========== */
const chaiLoading = document.getElementById('chaiLoading');

function showChaiLoading() {
  if (chaiLoading) {
    chaiLoading.classList.add('active');
    setTimeout(() => {
      chaiLoading.classList.remove('active');
    }, 1000);
  }
}

// Show on page transitions
window.addEventListener('beforeunload', showChaiLoading);

// Simulate loading on actual page load
window.addEventListener('load', () => {
  if (chaiLoading && window.location.pathname.includes('skills.html') || window.location.pathname.includes('about.html')) {
    showChaiLoading();
  }
});

/* ========== BACK TO TOP BUTTON ========== */
const backToTopButton = document.getElementById('backToTop');

if (backToTopButton) {
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      backToTopButton.classList.add('show');
    } else {
      backToTopButton.classList.remove('show');
    }
  });

  backToTopButton.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/* ========== FLOATING QUOTE ========== */
const floatingQuotes = [
  "Every day teaches you something new.",
  "Patience builds everything.",
  "Trust the process.",
  "Chai helps.",
  "Keep going, it makes sense later."
];

function showFloatingQuote() {
  const floatingQuote = document.querySelector('.floating-quote');
  if (!floatingQuote) return;

  const randomQuote = floatingQuotes[Math.floor(Math.random() * floatingQuotes.length)];
  const quoteP = document.createElement('p');
  quoteP.textContent = `"${randomQuote}"`;
  
  floatingQuote.innerHTML = '';
  floatingQuote.appendChild(quoteP);
  floatingQuote.classList.add('show');

  setTimeout(() => {
    floatingQuote.classList.remove('show');
  }, 5000);
}

// Show floating quote on page load
if (window.location.pathname.includes('index.html') || window.location.pathname.endsWith('/')) {
  window.addEventListener('load', () => {
    setTimeout(showFloatingQuote, 2000);
  });
}

/* ========== SCROLL-TRIGGERED QUOTE ========== */
let scrollQuoteShown = false;

if (window.location.pathname.includes('about.html')) {
  window.addEventListener('scroll', () => {
    if (scrollQuoteShown) return;

    const scrollPercentage = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;

    if (scrollPercentage >= 40) {
      const scrollQuote = document.getElementById('scrollQuote');
      if (scrollQuote) {
        scrollQuote.classList.add('show');
        scrollQuoteShown = true;

        setTimeout(() => {
          scrollQuote.classList.add('hide');
          setTimeout(() => {
            scrollQuote.classList.remove('show', 'hide');
            scrollQuoteShown = false;
          }, 800);
        }, 5000);
      }
    }
  });
}

/* ========== TIMELINE DROPDOWN PANELS ========== */
function initTimelineDropdowns() {
  const timelineItems = document.querySelectorAll('.timeline-item');

  timelineItems.forEach(item => {
    const heading = item.querySelector('h4');
    const dropdown = item.querySelector('.timeline-dropdown');

    if (heading && dropdown) {
      heading.style.cursor = 'pointer';
      heading.addEventListener('click', () => {
        const isOpen = item.classList.contains('opened');
        
        // Close all other dropdowns
        timelineItems.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('opened')) {
            otherItem.classList.remove('opened');
            const otherDropdown = otherItem.querySelector('.timeline-dropdown');
            if (otherDropdown) otherDropdown.classList.remove('active');
          }
        });

        // Toggle current dropdown
        if (!isOpen) {
          item.classList.add('opened');
          dropdown.classList.add('active');
        } else {
          item.classList.remove('opened');
          dropdown.classList.remove('active');
        }
      });
    }
  });
}

if (window.location.pathname.includes('skills.html')) {
  window.addEventListener('load', initTimelineDropdowns);
}

/* ========== CURSOR GLOW EFFECT ========== */
if (window.matchMedia('(hover: hover)').matches) {
  document.addEventListener('mousemove', (e) => {
    document.documentElement.style.setProperty('--cursor-x', e.clientX);
    document.documentElement.style.setProperty('--cursor-y', e.clientY);
  });
}

/* ========== FLOATING PARTICLES BACKGROUND ========== */
function createFloatingParticles() {
  const particleCount = 15;
  
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    const startX = Math.random() * 100;
    const startY = Math.random() * 100;
    const duration = 15 + Math.random() * 20;
    const tx = (Math.random() - 0.5) * 200;
    
    particle.style.left = startX + '%';
    particle.style.top = startY + '%';
    particle.style.setProperty('--tx', tx + 'px');
    particle.style.animationDuration = duration + 's';
    particle.style.animationDelay = Math.random() * 10 + 's';
    
    document.body.appendChild(particle);
  }
}

createFloatingParticles();

/* ========== CHAI EASTER EGG ========== */
let chaiBuffer = '';
let chaiTimeout;

document.addEventListener('keydown', (e) => {
  clearTimeout(chaiTimeout);
  chaiBuffer += e.key.toLowerCase();

  if (chaiBuffer.includes('chai')) {
    triggerChaiEmojis();
    chaiBuffer = '';
    return;
  }

  if (chaiBuffer.length > 10) {
    chaiBuffer = chaiBuffer.slice(-5);
  }

  chaiTimeout = setTimeout(() => {
    chaiBuffer = '';
  }, 1000);
});

function triggerChaiEmojis() {
  for (let i = 0; i < 15; i++) {
    setTimeout(() => {
      const emoji = document.createElement('div');
      emoji.textContent = '☕';
      emoji.style.position = 'fixed';
      emoji.style.left = Math.random() * 100 + '%';
      emoji.style.top = '-20px';
      emoji.style.fontSize = (20 + Math.random() * 20) + 'px';
      emoji.style.zIndex = 999;
      emoji.style.pointerEvents = 'none';
      emoji.style.opacity = '0.8';
      emoji.style.transition = 'all 1s ease-in';
      
      document.body.appendChild(emoji);

      setTimeout(() => {
        emoji.style.top = window.innerHeight + 'px';
        emoji.style.opacity = '0';
      }, 50);

      setTimeout(() => emoji.remove(), 1050);
    }, i * 50);
  }
}

/* ========== SECTION HEADER ANIMATIONS ========== */
function animateSectionHeaders() {
  const headers = document.querySelectorAll('.section-title');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animation = 'fadeInUp 0.8s ease-out';
        if (entry.target.querySelector('::after')) {
          // Trigger underline animation
        }
      }
    });
  }, { threshold: 0.5 });

  headers.forEach(header => observer.observe(header));
}

animateSectionHeaders();

/* ========== TIMELINE PULSE EFFECT ========== */
function addTimelinePulse() {
  const timelineBeforeElement = document.querySelector('.timeline::before');
  if (timelineBeforeElement) {
    setInterval(() => {
      timelineBeforeElement.style.animation = 'none';
      setTimeout(() => {
        timelineBeforeElement.style.animation = 'timelinePulse 2.5s ease-out';
      }, 10);
    }, 3000);
  }
}

if (window.location.pathname.includes('skills.html')) {
  window.addEventListener('load', addTimelinePulse);
}
/* ===========================
   ONE-TIME POPUP TRIGGERS
   =========================== */

// ---- HOME PAGE POPUP (after 5–7 seconds) ----
if (window.location.pathname.includes("index.html")) {
    setTimeout(() => {
        openPopup("homePopup", "once");
    }, Math.random() * 2000 + 5000); // between 5–7 seconds
}



// ---- STORY PAGE POPUP (true bottom only) ----
if (window.location.pathname.includes("story.html")) {
    let storyPopupShown = false;

    window.addEventListener("scroll", () => {
        if (storyPopupShown) return;

        const scrollPosition = window.innerHeight + window.scrollY;
        const pageHeight = document.body.offsetHeight - 50;

        if (scrollPosition >= pageHeight) {
            openPopup("storyEndPopup", "once");
            storyPopupShown = true;
        }
    });
}



// ---- SKILLS PAGE POPUP (halfway down) ----
if (window.location.pathname.includes("skills.html")) {
    let skillsPopupShown = false;

    window.addEventListener("scroll", () => {
        if (skillsPopupShown) return;

        const scrollPoint = window.scrollY;
        const halfway = document.body.scrollHeight / 2;

        if (scrollPoint >= halfway) {
            openPopup("skillsWarningPopup", "once");
            skillsPopupShown = true;
        }
    });
}

/* ========= FIXED POPUP SYSTEM (ONE PER PAGE, NO RANDOMNESS) ========= */

const POPUP_SESSION_KEY = "zain_popups_seen";

/* Load or initialize session state */
let popupState = JSON.parse(sessionStorage.getItem(POPUP_SESSION_KEY)) || {
    home: false,
    story: false,
    skills: false
};

function savePopupState() {
    sessionStorage.setItem(POPUP_SESSION_KEY, JSON.stringify(popupState));
}

/* Open popup by ID */
function openPopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    popup.classList.add("active");
}

/* Close popup by ID */
function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    if (!popup) return;

    popup.classList.remove("active");
}

/* ====================== PAGE-SPECIFIC TRIGGERS ====================== */

/* ------- HOME PAGE POPUP: after 5–7 seconds ------- */
if (window.location.pathname.includes("index") || window.location.pathname.endsWith("/")) {
    if (!popupState.home) {
        setTimeout(() => {
            openPopup("homePopup");
            popupState.home = true;
            savePopupState();
        }, Math.random() * (7000 - 5000) + 5000);
    }
}

/* ------- STORY POPUP: ONLY at real bottom ------- */
if (window.location.pathname.includes("about")) {

    if (!popupState.story) {
        window.addEventListener("scroll", () => {
            const reachedBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;
            if (reachedBottom) {
                openPopup("storyPopup");
                popupState.story = true;
                savePopupState();
            }
        });
    }
}

/* ------- SKILLS POPUP: halfway scroll ------- */
if (window.location.pathname.includes("skills")) {
    if (!popupState.skills) {
        window.addEventListener("scroll", () => {
            const halfway = document.body.scrollHeight * 0.5;
            if (window.scrollY >= halfway) {
                openPopup("skillsPopup");
                popupState.skills = true;
                savePopupState();
            }
        });
    }
}
