document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;

    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            themeToggle.innerHTML = '<span class="emoji">🌙</span> Dark Mode';
            localStorage.setItem('theme', 'dark');
            // GA4 event for theme change to dark mode
            if (typeof gtag === 'function') {
                gtag('event', 'theme_change', {
                    'theme_name': 'dark_mode'
                });
            }
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<span class="emoji">🌞</span> Light Mode';
            localStorage.setItem('theme', 'light');
            // GA4 event for theme change to light mode (THIS WAS MISSING)
            if (typeof gtag === 'function') {
                gtag('event', 'theme_change', {
                    'theme_name': 'light_mode'
                });
            }
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

    // Contact Form Submission
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
            formMessage.className = 'error';
            formMessage.textContent = 'Oops! Please fill out all fields. 🙏';
            // GA4 event for form error: missing fields
            if (typeof gtag === 'function') {
                gtag('event', 'form_submission', {
                    'form_name': 'contact_form',
                    'form_status': 'error',
                    'error_type': 'missing_fields'
                });
            }
        } else if (!emailPattern.test(email)) {
            formMessage.className = 'error';
            formMessage.textContent = 'Please enter a valid email address. 📧';
            // GA4 event for form error: invalid email (THIS WAS MISSING)
            if (typeof gtag === 'function') {
                gtag('event', 'form_submission', {
                    'form_name': 'contact_form',
                    'form_status': 'error',
                    'error_type': 'invalid_email'
                });
            }
        } else {
            formMessage.className = 'success';
            formMessage.textContent = 'Thanks for reaching out! We\'ll hit you back soon. 🔥';
            contactForm.reset();
            // GA4 event for successful form submission (THIS WAS MISSING)
            if (typeof gtag === 'function') {
                gtag('event', 'form_submission', {
                    'form_name': 'contact_form',
                    'form_status': 'success'
                });
            }
        }

        formMessage.classList.remove('hidden');

        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    });

    // Download Button Click Tracking
    const downloadButton = document.querySelector('a[download="VibeCheck_Starter_Pack.pdf"]');
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            if (typeof gtag === 'function') {
                gtag('event', 'file_download', {
                    'file_name': 'VibeCheck_Starter_Pack.pdf',
                    'file_type': 'pdf'
                });
            }
        });
    }
});
