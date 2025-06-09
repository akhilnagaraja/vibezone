document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle (Moved to the top for proper initialization) ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            themeToggle.innerHTML = '<span class="emoji">🌙</span> Dark Mode';
            localStorage.setItem('theme', 'dark');
            // GA4 event for theme change to dark mode via dataLayer.push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'theme_change_custom', // Use a custom event name for dataLayer
                'theme_name': 'dark_mode'
            });
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<span class="emoji">🌞</span> Light Mode';
            localStorage.setItem('theme', 'light');
            // GA4 event for theme change to light mode via dataLayer.push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'theme_change_custom', // Use a custom event name for dataLayer
                'theme_name': 'light_mode'
            });
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    themeToggle.addEventListener('click', () => {
        if (body.classList.contains('light-mode')) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Confetti Effect Function ---
    function runConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        // Ensure canvas exists before proceeding
        if (!canvas) {
            console.error('Confetti canvas element not found!');
            return;
        }
        const ctx = canvas.getContext('2d');
        let W = window.innerWidth;
        let H = window.innerHeight;
        canvas.width = W;
        canvas.height = H;

        const maxConfetti = 150;
        const confetti = [];

        const colors = [
            { front: '#b800e6', back: '#6d008b' }, // Purple
            { front: '#00d4ff', back: '#00839e' }, // Blue
            { front: '#ff69b4', back: '#c20074' }, // Hot Pink
            { front: '#ffd700', back: '#ccaa00' }  // Gold
        ];

        function randomFrom(arr) {
            return arr[Math.floor(Math.random() * arr.length)];
        }

        function Confetti() {
            this.rgb = randomFrom(colors);
            this.r = 2 + (Math.random() * 8); // Radius
            this.x = Math.random() * W;
            this.y = Math.random() * H - H;
            this.dx = Math.random() * 2 - 1;
            this.dy = Math.random() * 5 + 2;
            this.tilt = Math.random() * 10 - 5;
            this.tiltAngle = Math.random() * Math.PI;
            this.tiltAngleIncrement = Math.random() * 0.1 - 0.05;
            this.opacity = 1;
            this.dopacity = 0.02; // Rate of opacity decrease
        }

        Confetti.prototype.draw = function() {
            ctx.beginPath();
            ctx.lineWidth = this.r / 2;
            ctx.strokeStyle = this.rgb.front;
            ctx.fillStyle = this.rgb.back;
            ctx.moveTo(this.x + this.tilt + (this.r * Math.sin(this.tiltAngle)), this.y);
            ctx.lineTo(this.x + this.tilt, this.y + this.tilt + (this.r * Math.cos(this.tiltAngle)));
            ctx.stroke();
            ctx.fill();
        };

        function animateConfetti() {
            ctx.clearRect(0, 0, W, H);

            let remainingConfetti = [];
            confetti.forEach(c => {
                c.x += c.dx;
                c.y += c.dy;
                c.tiltAngle += c.tiltAngleIncrement;
                c.opacity -= c.dopacity;

                if (c.opacity > 0) {
                    c.draw();
                    remainingConfetti.push(c);
                }
            });
            confetti.splice(0, confetti.length, ...remainingConfetti); // Update the array in place

            if (confetti.length < maxConfetti) {
                confetti.push(new Confetti());
            }

            // Only continue animation if there is confetti to draw
            if (confetti.length > 0) {
                requestAnimationFrame(animateConfetti);
            } else {
                // Once all confetti has faded, clear the canvas again to ensure no residue
                ctx.clearRect(0, 0, W, H);
            }
        }

        // Start the animation
        animateConfetti();
    }

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        // Corrected email regex: removed double backslashes
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
            formMessage.className = 'error';
            formMessage.textContent = 'Oops! Please fill out all fields. 🙏';
            // GA4 event for form error: missing fields via dataLayer.push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'form_submission_custom', // Use a custom event name for dataLayer
                'form_name': 'contact_form',
                'form_status': 'error',
                'error_type': 'missing_fields'
            });
        } else if (!emailPattern.test(email)) {
            formMessage.className = 'error';
            formMessage.textContent = 'Please enter a valid email address. 📧';
            // GA4 event for form error: invalid email via dataLayer.push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'form_submission_custom', // Use a custom event name for dataLayer
                'form_name': 'contact_form',
                'form_status': 'error',
                'error_type': 'invalid_email'
            });
        } else {
            // SUCCESS BLOCK: Confetti function called here
            formMessage.className = 'success';
            formMessage.textContent = 'Thanks for reaching out! We\'ll hit you back soon. 🔥';
            contactForm.reset();
            runConfetti(); // Call the confetti function on successful submission!
            // GA4 event for successful form submission via dataLayer.push
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'form_submission_custom', // Use a custom event name for dataLayer
                'form_name': 'contact_form',
                'form_status': 'success'
            });
        }

        formMessage.classList.remove('hidden');

        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    });

    // --- Download Button Click Tracking via dataLayer.push ---
    const downloadButton = document.querySelector('a[download="VibeCheck_Starter_Pack.pdf"]');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'file_download_custom', // Use a custom event name for dataLayer
                'file_name': 'VibeCheck_Starter_Pack.pdf',
                'file_type': 'pdf',
                'page_location': window.location.href, // Good to include context
                'page_title': document.title
            });
        });
    }
});
