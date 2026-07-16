// Enhanced scroll animations for all sections
document.addEventListener('DOMContentLoaded', function () {
    // Check if device is mobile/tablet
    function isMobile() {
        return window.innerWidth <= 768;
    }

    // Create intersection observer for scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');

                // Handle staggered animations for child elements
                const staggeredElements = entry.target.querySelectorAll('.stagger-1, .stagger-2, .stagger-3, .stagger-4, .stagger-5');
                staggeredElements.forEach((element, index) => {
                    setTimeout(() => {
                        element.classList.add('in-view');
                    }, index * 100);
                });
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '0px 0px -50px 0px'
    });

    // Observe all elements with animate-on-scroll class
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(element => {
        observer.observe(element);
    });

    // Mobile-specific animations
    if (isMobile()) {
        // Create separate observer for mobile hover effects
        const mobileHoverObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe all interactive cards for mobile
        const interactiveCards = document.querySelectorAll('.card-outlined-blur, .service-card, .facility-card, .startup-card, .process-step');
        interactiveCards.forEach(card => {
            mobileHoverObserver.observe(card);
        });

        // Add staggered delays for mobile
        interactiveCards.forEach((card, index) => {
            card.style.transitionDelay = `${index * 0.1}s`;
        });
    }

    // Handle window resize
    window.addEventListener('resize', function () {
        if (!isMobile()) {
            // Remove mobile-specific in-view classes on desktop
            document.querySelectorAll('.service-card.in-view, .facility-card.in-view, .startup-card.in-view, .process-step.in-view').forEach(card => {
                if (!card.classList.contains('animate-on-scroll')) {
                    card.classList.remove('in-view');
                }
            });
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mobile Navigation Toggle
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function () {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navToggle.contains(e.target) && !navLinks.contains(e.target)) {
                navToggle.classList.remove('active');
                navLinks.classList.remove('active');
            }
        });
    }

    // Scroll Progress Bar - throttled for performance
    function updateScrollProgress() {
        const scrollProgressBar = document.getElementById('scroll-progress-bar');
        if (!scrollProgressBar) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        scrollProgressBar.style.width = scrollPercent + '%';
    }

    // Throttled scroll listener for smooth performance
    let ticking = false;
    window.addEventListener('scroll', function () {
        if (!ticking) {
            window.requestAnimationFrame(function () {
                updateScrollProgress();
                ticking = false;
            });
            ticking = true;
        }
    });

    window.addEventListener('resize', updateScrollProgress);

    // Initial update on page load
    updateScrollProgress();

    // Form submission handler (Web3Forms API)
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const form = this;
            const submitBtn = form.querySelector('button[type="submit"]');
            const feedback = form.querySelector('#contact-feedback');
            const formData = new FormData(form);

            // Get form values for validation
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();

            // Basic validation
            if (!name || !email || !message) {
                feedback.style.display = 'block';
                feedback.textContent = 'Please fill in all required fields.';
                feedback.style.color = '#ff4444';
                feedback.style.backgroundColor = '#ffebee';
                feedback.style.padding = '10px';
                feedback.style.borderRadius = '4px';
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                feedback.style.display = 'block';
                feedback.textContent = 'Please enter a valid email address.';
                feedback.style.color = '#ff4444';
                feedback.style.backgroundColor = '#ffebee';
                feedback.style.padding = '10px';
                feedback.style.borderRadius = '4px';
                return;
            }

            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';
            feedback.style.display = 'block';
            feedback.textContent = 'Sending your message...';
            feedback.style.color = '#333';
            feedback.style.backgroundColor = '#e3f2fd';
            feedback.style.padding = '10px';
            feedback.style.borderRadius = '4px';

            try {
                // Send to Web3Forms API
                console.log('Submitting form to Web3Forms...');
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                console.log('Web3Forms API Response:', data);
                console.log('Response Status:', response.status);
                console.log('Response OK:', response.ok);

                if (response.ok && data.success) {
                    // Success
                    feedback.textContent = '✓ Message sent successfully! We\'ll get back to you soon.';
                    feedback.style.color = '#2e7d32';
                    feedback.style.backgroundColor = '#e8f5e9';
                    form.reset();

                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        feedback.style.display = 'none';
                    }, 5000);
                } else {
                    // API returned error
                    throw new Error(data.message || 'Failed to send message');
                }

            } catch (error) {
                // Error handling
                console.error('Form submission error:', error);
                feedback.textContent = '✗ Network error. Please check your connection and try again, or email us directly at orbiit@rajagiritech.edu.in';
                feedback.style.color = '#c62828';
                feedback.style.backgroundColor = '#ffebee';
            } finally {
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
            }
        });
    }
});

// ===== CUSTOM CURSOR SYSTEM =====
// Premium dark grey cursor with subtle glow
(function initCustomCursor() {
    'use strict';

    // Only enable on non-touch desktop devices
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    if (isTouchDevice || isSmallScreen) return;

    document.body.classList.add('custom-cursor-active');

    // --- Create cursor elements ---
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.id = 'cursor-ring';

    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.id = 'cursor-glow';

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    dot.id = 'cursor-dot';

    document.body.appendChild(ring);
    document.body.appendChild(glow);
    document.body.appendChild(dot);

    // --- State ---
    let cursorX = -100;
    let cursorY = -100;
    let ringX = -100;
    let ringY = -100;
    let isHovering = false;
    let isClicking = false;
    let isVisible = false;

    // --- Particle system ---
    const particles = [];
    const MAX_PARTICLES = 18;
    const PARTICLE_SPAWN_INTERVAL = 35; // ms
    let lastSpawnTime = 0;

    // Interactive elements the cursor reacts to
    const hoverSelectors = [
        'a', 'button', '.btn',
        '.card-outlined-blur', '.service-card',
        '.facility-card', '.startup-card',
        '.process-step', '.step-number',
        'input', 'textarea', 'select',
        '.social-links a', '.contact-item'
    ].join(',');

    function isInteractiveElement(target) {
        if (!target || !target.matches) return false;
        if (target.matches(hoverSelectors)) return true;
        return !!target.closest(hoverSelectors);
    }

    // --- Mouse move handler ---
    document.addEventListener('mousemove', function (e) {
        cursorX = e.clientX;
        cursorY = e.clientY;

        if (!isVisible) {
            isVisible = true;
            // Snap ring to cursor on first move
            ringX = cursorX;
            ringY = cursorY;
        }

        // Update dot instantly
        dot.style.transform = 'translate(' + cursorX + 'px, ' + cursorY + 'px)';

        // Spawn particle trail
        const now = Date.now();
        if (now - lastSpawnTime > PARTICLE_SPAWN_INTERVAL) {
            spawnParticle(cursorX, cursorY);
            lastSpawnTime = now;
        }

        // Check if over dark background (header/footer)
        const onDarkBg = e.target.closest && e.target.closest('header, footer, [data-cursor="light"]');
        if (onDarkBg && !ring.classList.contains('on-dark-bg')) {
            ring.classList.add('on-dark-bg');
            glow.classList.add('on-dark-bg');
            dot.classList.add('on-dark-bg');
        } else if (!onDarkBg && ring.classList.contains('on-dark-bg')) {
            ring.classList.remove('on-dark-bg');
            glow.classList.remove('on-dark-bg');
            dot.classList.remove('on-dark-bg');
        }

        // Check hover state
        const interactive = isInteractiveElement(e.target);
        if (interactive && !isHovering) {
            isHovering = true;
            ring.classList.add('hovering');
            glow.classList.add('hovering');
            dot.classList.add('hovering');
        } else if (!interactive && isHovering) {
            isHovering = false;
            ring.classList.remove('hovering');
            glow.classList.remove('hovering');
            dot.classList.remove('hovering');
        }
    });

    // --- Mouse leave window ---
    document.addEventListener('mouseleave', function () {
        isVisible = false;
        ring.classList.add('hidden');
        glow.classList.add('hidden');
        dot.classList.add('hidden');
    });

    document.addEventListener('mouseenter', function () {
        isVisible = true;
        ring.classList.remove('hidden');
        glow.classList.remove('hidden');
        dot.classList.remove('hidden');
    });

    // --- Click effects ---
    document.addEventListener('mousedown', function () {
        isClicking = true;
        ring.classList.add('clicking');
        glow.classList.add('clicking');
        dot.classList.add('clicking');
    });

    document.addEventListener('mouseup', function () {
        isClicking = false;
        ring.classList.remove('clicking');
        glow.classList.remove('clicking');
        dot.classList.remove('clicking');
    });

    // --- Particle spawn (dark grey glow particles) ---
    function spawnParticle(x, y) {
        if (particles.length >= MAX_PARTICLES) {
            const oldest = particles.shift();
            if (oldest && oldest.element && oldest.element.parentNode) {
                oldest.element.remove();
            }
        }

        const el = document.createElement('div');
        el.className = 'cursor-particle';

        const size = 3 + Math.random() * 4;
        el.style.width = size + 'px';
        el.style.height = size + 'px';
        el.style.borderWidth = (1 + Math.random() * 0.8) + 'px';

        // Dark grey-tinted particles
        const alpha = 0.3 + Math.random() * 0.4;
        const greyVal = Math.floor(80 + Math.random() * 100); // 80-180
        el.style.borderColor = 'rgba(' + greyVal + ', ' + greyVal + ', ' + greyVal + ', ' + alpha + ')';
        el.style.backgroundColor = 'rgba(' + greyVal + ', ' + greyVal + ', ' + greyVal + ', ' + (alpha * 0.12) + ')';
        el.style.boxShadow = '0 0 4px rgba(' + greyVal + ', ' + greyVal + ', ' + greyVal + ', ' + (alpha * 0.25) + ')';

        document.body.appendChild(el);

        const life = 20 + Math.random() * 14;

        particles.push({
            element: el,
            x: x + (Math.random() - 0.5) * 14,
            y: y + (Math.random() - 0.5) * 14,
            opacity: 0.6,
            scale: 1,
            life: life,
            maxLife: life,
            driftX: (Math.random() - 0.5) * 0.5,
            driftY: -0.2 - Math.random() * 0.6
        });
    }

    // --- Animation loop (smooth ring + glow + particles) ---
    function animate() {
        // Smooth ring follow with inertia
        if (isVisible) {
            ringX += (cursorX - ringX) * 0.12;
            ringY += (cursorY - ringY) * 0.12;

            ring.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
            glow.style.transform = 'translate(' + ringX + 'px, ' + ringY + 'px)';
        }

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            if (!p || !p.element) {
                particles.splice(i, 1);
                continue;
            }

            p.life -= 1;

            if (p.life <= 0) {
                if (p.element.parentNode) p.element.remove();
                particles.splice(i, 1);
                continue;
            }

            p.opacity = (p.life / p.maxLife) * 0.6;
            p.scale = 0.2 + (p.life / p.maxLife) * 0.8;
            p.y += p.driftY;
            p.x += p.driftX;

            p.element.style.opacity = p.opacity;
            p.element.style.transform = 'translate(' + p.x + 'px, ' + p.y + 'px) scale(' + p.scale + ')';
        }

        requestAnimationFrame(animate);
    }

    // Start animation loop
    animate();
})();

// Add parallax effect for stars (existing functionality preserved)
document.addEventListener('mousemove', function (e) {
    // Only apply on desktop
    if (window.innerWidth > 768) {
        const mouseX = (e.clientX / window.innerWidth) - 0.5;
        const mouseY = (e.clientY / window.innerHeight) - 0.5;

        const orbiitContainer = document.querySelector('.orbiit-container');
        if (orbiitContainer) {
            orbiitContainer.style.transform = `translate(-50%, -50%) 
                translateX(${mouseX * 20}px) 
                translateY(${mouseY * 20}px)`;
        }

        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            const speed = (index + 1) * 0.5;
            star.style.transform += ` 
                translateX(${mouseX * speed}px) 
                translateY(${mouseY * speed}px)`;
        });
    }
});