        // Navbar scroll effect
        window.addEventListener('scroll', function() {
            const navbar = document.querySelector('.navbar-custom');
            if (window.scrollY > 100) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });

        // Parallax effect
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const parallaxElements = document.querySelectorAll('.floating-shape');
            
            parallaxElements.forEach((element, index) => {
                const speed = 0.5 + (index * 0.1);
                element.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
            });

            const cityBuildings = document.querySelectorAll('.building');
            cityBuildings.forEach((building, index) => {
                const speed = 0.3 + (index * 0.05);
                building.style.transform = `translateY(${scrolled * speed}px)`;
            });
        });

        // Scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, observerOptions);

        // Observe all scroll-animate elements
        document.querySelectorAll('.scroll-animate').forEach(el => {
            observer.observe(el);
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

        // Dynamic button interactions
        document.querySelectorAll('.btn-primary-custom, .btn-secondary-custom').forEach(btn => {
            btn.addEventListener('click', function() {
                // Create ripple effect
                const ripple = document.createElement('span');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = event.clientX - rect.left - size / 2;
                const y = event.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255,255,255,0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                `;
                
                this.style.position = 'relative';
                this.style.overflow = 'hidden';
                this.appendChild(ripple);
                
                setTimeout(() => {
                    ripple.remove();
                }, 600);
            });
        });

        // Add ripple animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(2);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

        // Feature card hover effects with 3D transform
        document.querySelectorAll('.feature-card').forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = this.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;
                
                this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });

        // Dynamic counter animation for stats
      document.addEventListener("DOMContentLoaded", () => {
    function animateCounters() {
        const counters = [
            { target: 50000, suffix: '+', label: 'Citizens Served' },
            { target: 99, suffix: '%', label: 'Uptime' },
            { target: 25, suffix: '+', label: 'AI Services' },
            { target: 100, suffix: '%', label: 'Web-Based' }
        ];

        // Create section
        if (!document.querySelector('.stats-section')) {
            const statsSection = document.createElement('section');
            statsSection.className = 'section stats-section';
            statsSection.style.cssText = `
                background: linear-gradient(135deg, var(--primary), var(--secondary));
                color: white;
            `;

            statsSection.innerHTML = `
                <div class="container">
                    <div class="row text-center">
                        ${counters.map((counter, i) => `
                            <div class="col-lg-3 col-md-6 mb-4">
                                <div class="stat-item">
                                    <div class="stat-number" 
                                         data-target="${counter.target}" 
                                         data-suffix="${counter.suffix}">
                                         0${counter.suffix}
                                    </div>
                                    <div class="stat-label">${counter.label}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Insert after benefits section if it exists
            const benefitsSection = document.querySelector('.benefits-section');
            if (benefitsSection) {
                benefitsSection.parentNode.insertBefore(statsSection, benefitsSection.nextSibling);
            } else {
                document.body.appendChild(statsSection);
            }

            // Add styles
            const statsStyle = document.createElement('style');
            statsStyle.textContent = `
                .stats-section {
                    padding: 80px 0;
                }
                .stat-item {
                    padding: 30px 20px;
                }
                .stat-number {
                    font-size: 3.5rem;
                    font-weight: 800;
                    margin-bottom: 10px;
                    background: linear-gradient(45deg, #fff, var(--light-blue));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .stat-label {
                    font-size: 1.1rem;
                    opacity: 0.9;
                    font-weight: 500;
                }
            `;
            document.head.appendChild(statsStyle);

            // Start animation
            animateNumbers();
        }

        function animateNumbers() {
            const statNumbers = document.querySelectorAll('.stat-number');

            statNumbers.forEach(el => {
                const target = +el.getAttribute('data-target');
                const suffix = el.getAttribute('data-suffix');
                let count = 0;
                const increment = Math.max(1, target / 100);

                const updateCounter = () => {
                    count += increment;
                    if (count < target) {
                        el.textContent = `${Math.floor(count)}${suffix}`;
                        requestAnimationFrame(updateCounter);
                    } else {
                        el.textContent = `${target}${suffix}`;
                    }
                };
                updateCounter();
            });
        }
    }

    // Call the function
    animateCounters();
});

        // Add user testimonials section
        function createTestimonialsSection() {
            const testimonials = [
                {
                    name: "Dr. Sarah Chen",
                    role: "Urban Planning Director",
                    text: "This platform revolutionizes how we approach smart city development. The AI integration is seamless and incredibly effective.",
                    rating: 5
                },
                {
                    name: "Michael Rodriguez",
                    role: "Tech Entrepreneur",
                    text: "Outstanding web-based solution! The API integrations work flawlessly and the user experience is exceptional.",
                    rating: 5
                },
                {
                    name: "Emma Thompson",
                    role: "City Council Member",
                    text: "Finally, a comprehensive platform that bridges the gap between citizens and government services efficiently.",
                    rating: 5
                }
            ];

            const testimonialsSection = document.createElement('section');
            testimonialsSection.className = 'section testimonials-section';
            testimonialsSection.innerHTML = `
                <div class="container">
                    <h2 class="section-title scroll-animate">What People Say</h2>
                    <div class="row">
                        ${testimonials.map(testimonial => `
                            <div class="col-lg-4 col-md-6 scroll-animate">
                                <div class="testimonial-card">
                                    <div class="testimonial-content">
                                        <div class="stars">
                                            ${'★'.repeat(testimonial.rating)}
                                        </div>
                                        <p>"${testimonial.text}"</p>
                                    </div>
                                    <div class="testimonial-author">
                                        <h5>${testimonial.name}</h5>
                                        <span>${testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;

            // Insert before APIs section
            const apisSection = document.querySelector('.apis-section');
            apisSection.parentNode.insertBefore(testimonialsSection, apisSection);

            // Add testimonials styles
            const testimonialsStyle = document.createElement('style');
            testimonialsStyle.textContent = `
                .testimonials-section {
                    background: white;
                }
                .testimonial-card {
                    background: linear-gradient(135deg, var(--light-blue), var(--light-teal));
                    border-radius: 20px;
                    padding: 40px 30px;
                    margin-bottom: 30px;
                    text-align: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
                    position: relative;
                    overflow: hidden;
                }
                .testimonial-card::before {
                    content: '';
                    position: absolute;
                    top: -50%;
                    left: -50%;
                    width: 200%;
                    height: 200%;
                    background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
                    transform: rotate(45deg);
                    transition: all 0.5s ease;
                    opacity: 0;
                }
                .testimonial-card:hover::before {
                    opacity: 1;
                    transform: rotate(45deg) translate(50%, 50%);
                }
                .testimonial-card:hover {
                    transform: translateY(-10px);
                    box-shadow: 0 20px 50px rgba(0,0,0,0.15);
                }
                .stars {
                    color: #FFD700;
                    font-size: 1.5rem;
                    margin-bottom: 20px;
                }
                .testimonial-content p {
                    font-size: 1.1rem;
                    line-height: 1.6;
                    margin-bottom: 25px;
                    color: var(--primary);
                    font-style: italic;
                }
                .testimonial-author h5 {
                    color: var(--primary);
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                .testimonial-author span {
                    color: var(--secondary);
                    font-size: 0.9rem;
                }
            `;
            document.head.appendChild(testimonialsStyle);
        }

        createTestimonialsSection();

        // Add Call-to-Action section
        function createCTASection() {
            const ctaSection = document.createElement('section');
            ctaSection.className = 'section cta-section';
            ctaSection.innerHTML = `
                <div class="container">
                    <div class="row justify-content-center text-center">
                        <div class="col-lg-8">
                            <h2 class="cta-title scroll-animate">Ready to Transform Your City?</h2>
                            <p class="cta-description scroll-animate">
                                Join the smart city revolution with our comprehensive AI-powered platform. 
                                Start building the future of urban management today.
                            </p>
                            <div class="cta-buttons-section scroll-animate">
                                <button class="btn btn-primary-custom me-3">Get Started Now</button>
                                <button class="btn btn-secondary-custom">Schedule Demo</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Insert before closing of parallax container
            const parallaxContainer = document.querySelector('.parallax-container');
            parallaxContainer.appendChild(ctaSection);

            // Add CTA styles
            const ctaStyle = document.createElement('style');
            ctaStyle.textContent = `
                .cta-section {
                    background: linear-gradient(135deg, var(--secondary), var(--primary));
                    color: white;
                    padding: 100px 0;
                }
                .cta-title {
                    font-size: 3rem;
                    font-weight: 700;
                    margin-bottom: 30px;
                    background: linear-gradient(45deg, #fff, var(--light-blue));
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .cta-description {
                    font-size: 1.3rem;
                    line-height: 1.6;
                    margin-bottom: 40px;
                    opacity: 0.9;
                }
                .cta-buttons-section .btn {
                    margin: 10px;
                }
                @media (max-width: 768px) {
                    .cta-title { font-size: 2.2rem; }
                    .cta-description { font-size: 1.1rem; }
                    .cta-buttons-section .btn { 
                        display: block; 
                        width: 80%; 
                        margin: 10px auto; 
                    }
                }
            `;
            document.head.appendChild(ctaStyle);
        }

        createCTASection();

        // Add Footer
        function createFooter() {
            const footer = document.createElement('footer');
            footer.className = 'footer-section';
            footer.innerHTML = `
                <div class="container">
                    <div class="row">
                        <div class="col-lg-4 col-md-6 mb-4">
                            <h4><i class="fas fa-city"></i> SmartCity Portal</h4>
                            <p>Transforming urban landscapes through intelligent AI-powered web solutions for a sustainable and connected future.</p>
                            <div class="social-links">
                                <a href="#"><i class="fab fa-facebook"></i></a>
                                <a href="#"><i class="fab fa-twitter"></i></a>
                                <a href="#"><i class="fab fa-linkedin"></i></a>
                                <a href="#"><i class="fab fa-github"></i></a>
                            </div>
                        </div>
                        <div class="col-lg-2 col-md-6 mb-4">
                            <h5>Platform</h5>
                            <ul class="footer-links">
                                <li><a href="#features">Features</a></li>
                                <li><a href="#apis">APIs</a></li>
                                <li><a href="#tech">Technology</a></li>
                                <li><a href="#">Documentation</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-2 col-md-6 mb-4">
                            <h5>Services</h5>
                            <ul class="footer-links">
                                <li><a href="#">Smart Governance</a></li>
                                <li><a href="#">Mobility Solutions</a></li>
                                <li><a href="#">Environmental</a></li>
                                <li><a href="#">Healthcare</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-2 col-md-6 mb-4">
                            <h5>Support</h5>
                            <ul class="footer-links">
                                <li><a href="#">Help Center</a></li>
                                <li><a href="#">Contact Us</a></li>
                                <li><a href="#">Community</a></li>
                                <li><a href="#">Updates</a></li>
                            </ul>
                        </div>
                        <div class="col-lg-2 col-md-6 mb-4">
                            <h5>Legal</h5>
                            <ul class="footer-links">
                                <li><a href="#">Privacy Policy</a></li>
                                <li><a href="#">Terms of Service</a></li>
                                <li><a href="#">Cookie Policy</a></li>
                                <li><a href="#">Disclaimer</a></li>
                            </ul>
                        </div>
                    </div>
                    <hr class="footer-divider">
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <p>&copy; 2025 SmartCity Portal. All rights reserved.</p>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <p>Built with ❤️ for a smarter tomorrow</p>
                        </div>
                    </div>
                </div>
            `;

            // Insert after parallax container
            const parallaxContainer = document.querySelector('.parallax-container');
            parallaxContainer.parentNode.insertBefore(footer, parallaxContainer.nextSibling);

            // Add footer styles
            const footerStyle = document.createElement('style');
            footerStyle.textContent = `
                .footer-section {
                    background: var(--primary);
                    color: white;
                    padding: 60px 0 30px;
                }
                .footer-section h4 {
                    color: var(--light-blue);
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .footer-section h5 {
                    color: var(--accent);
                    margin-bottom: 20px;
                    font-weight: 600;
                }
                .footer-links {
                    list-style: none;
                    padding: 0;
                }
                .footer-links li {
                    margin-bottom: 10px;
                }
                .footer-links a {
                    color: rgba(255,255,255,0.8);
                    text-decoration: none;
                    transition: color 0.3s ease;
                }
                .footer-links a:hover {
                    color: var(--light-blue);
                }
                .social-links {
                    margin-top: 20px;
                }
                .social-links a {
                    display: inline-block;
                    width: 40px;
                    height: 40px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    text-align: center;
                    line-height: 40px;
                    margin-right: 10px;
                    color: white;
                    transition: all 0.3s ease;
                }
                .social-links a:hover {
                    background: var(--accent);
                    transform: translateY(-3px);
                }
                .footer-divider {
                    border-color: rgba(255,255,255,0.2);
                    margin: 40px 0 30px;
                }
                .footer-section p {
                    margin: 0;
                    opacity: 0.8;
                }
            `;
            document.head.appendChild(footerStyle);
        }

        createFooter();

        // Initialize all observers for new sections
        setTimeout(() => {
            document.querySelectorAll('.scroll-animate').forEach(el => {
                if (!el.classList.contains('animate')) {
                    observer.observe(el);
                }
            });
        }, 100);

        // Add loading animation
        window.addEventListener('load', function() {
            document.body.style.opacity = '0';
            document.body.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                document.body.style.opacity = '1';
            }, 100);
        });

        console.log('🌟 Smart City Portal loaded successfully!');