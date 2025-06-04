document.addEventListener('DOMContentLoaded', () => {
    // --- Theme Toggle ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            themeToggle.innerHTML = '<span class="emoji">🌙</span> Dark Mode';
            localStorage.setItem('theme', 'dark');
            // GA4 Tracking: Theme changed to Dark Mode
            gtag('event', 'theme_change', {
                'theme_mode': 'dark_mode'
            });
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<span class="emoji">🌞</span> Light Mode';
            localStorage.setItem('theme', 'light');
            // GA4 Tracking: Theme changed to Light Mode
            gtag('event', 'theme_change', {
                'theme_mode': 'light_mode'
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

    // --- "Join the Vibe" Button Click Tracking ---
    const joinButton = document.querySelector('#hero .genz-button'); // Target the button in the hero section
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            gtag('event', 'join_click', {
                'page_section': 'Hero',
                'join_clicks': 1
            });
        });
    }


    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex

        let formStatus = 'error'; // Default status

        if (!name || !email || !message) {
            formMessage.className = 'error'; // Set class directly
            formMessage.textContent = 'Oops! Please fill out all fields. 🙏';
        } else if (!emailPattern.test(email)) {
            formMessage.className = 'error'; // Set class directly
            formMessage.textContent = 'Please enter a valid email address. 📧';
        } else {
            formMessage.className = 'success'; // Set class directly
            formMessage.textContent = 'Thanks for reaching out! We\'ll hit you back soon. 🔥';
            contactForm.reset(); // Clear the form
            formStatus = 'success'; // Update status on success
        }

        formMessage.classList.remove('hidden'); // Ensure message is visible

        // GA4 Tracking: Form Submission
        gtag('event', 'form_submit', {
            'page_section': 'Contact',
            'form_submission_status': formStatus,
            'form_submissions': 1
        });

        // Hide message after a few seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    });

    // --- File Download Tracking ---
    const downloadLink = document.querySelector('a[download]'); // Targets any <a> tag with a download attribute
    if (downloadLink) {
        downloadLink.addEventListener('click', () => {
            gtag('event', 'file_download', {
                'page_section': 'Download',
                'download_type': 'PDF',
                'file_downloads_count': 1
            });
        });
    }

    // --- Video Play Tracking (Basic) ---
    const videoFrame = document.querySelector('#featured-video iframe');
    if (videoFrame) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gtag('event', 'video_view', {
                        'video_title': 'HOW GEN Z brain works 🧠😂'
                    });
                    videoObserver.unobserve(entry.target); // Only track once per page load
                }
            });
        }, { threshold: 0.5 }); // Trigger when 50% of the video section is visible

        videoObserver.observe(document.getElementById('featured-video'));
    }


    // --- TARA VOICE ASSISTANT LOGIC ---
    const taraMicButton = document.getElementById('tara-mic-button');
    const alwaysListeningToggle = document.getElementById('always-listening-toggle');
    const listeningModeLabel = document.getElementById('listening-mode-label');
    const taraResponseBox = document.getElementById('tara-response-box');
    const taraResponseText = document.getElementById('tara-response-text');

    let recognition; // Will hold our SpeechRecognition object
    const synth = window.speechSynthesis; // Web Speech Synthesis API

    // Function to make Tara speak
    function speak(text) {
        if (synth.speaking) {
            console.warn('Tara is already speaking. Waiting...');
            return;
        }
        if (text !== '') {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = getTaraVoice(); // Set Tara's voice
            utterance.pitch = 1;
            utterance.rate = 1;
            utterance.volume = 1;
            utterance.lang = 'en-US'; // Ensure American English

            utterance.onstart = () => {
                taraResponseText.textContent = text;
                taraResponseBox.classList.remove('hidden');
            };
            utterance.onend = () => {
                if (!alwaysListeningToggle.checked) { // Only hide if not in always listening mode
                    setTimeout(() => {
                        taraResponseBox.classList.add('hidden');
                        taraResponseText.textContent = '';
                    }, 1500); // Keep response visible for a bit
                }
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
                taraResponseBox.classList.add('hidden'); // Hide on error
            };
            synth.speak(utterance);
        }
    }

    // Function to find a suitable American female voice for Tara
    function getTaraVoice() {
        const voices = synth.getVoices();
        // Prioritize specific American English female voices
        let taraVoice = voices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US' && voice.default) ||
                        voices.find(voice => voice.name.includes('Google US English') && voice.lang === 'en-US') ||
                        voices.find(voice => voice.name.includes('Samantha') && voice.lang === 'en-US') || // iOS/macOS voice
                        voices.find(voice => voice.name.includes('Karen') && voice.lang === 'en-AU') || // Australian, but often sounds soft
                        voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));

        // Fallback to any default US English female voice
        if (!taraVoice) {
            taraVoice = voices.find(voice => voice.lang === 'en-US' && voice.default) ||
                        voices.find(voice => voice.lang === 'en-US' && voice.gender === 'female') ||
                        voices.find(voice => voice.lang === 'en-US'); // Last resort
        }
        return taraVoice || voices[0]; // If all else fails, return the first voice
    }

    // Ensure voices are loaded before trying to set Tara's voice
    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = getTaraVoice;
    }


    // Initialize Speech Recognition
    function initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            speak("Oops! Your browser doesn't fully support voice commands. Please try Chrome.");
            taraMicButton.disabled = true;
            alwaysListeningToggle.disabled = true;
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.continuous = false; // Only true for always listening mode
        recognition.interimResults = false;
        recognition.lang = 'en-US'; // Set to American English

        recognition.onstart = () => {
            taraMicButton.classList.add('listening');
            taraMicButton.innerHTML = '<span class="emoji">🎧</span> Listening...';
            taraResponseText.textContent = 'Listening for commands...';
            taraResponseBox.classList.remove('hidden');
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript.toLowerCase();
            console.log('Voice Command:', transcript);
            handleVoiceCommand(transcript);
            taraMicButton.classList.remove('listening');
            taraMicButton.innerHTML = '<span class="emoji">🎤</span> Talk to Tara';
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error', event.error);
            taraMicButton.classList.remove('listening');
            taraMicButton.innerHTML = '<span class="emoji">🎤</span> Talk to Tara';
            let commandStatus = 'fail'; // Default to fail
            if (event.error === 'no-speech') {
                speak("Sorry, I didn't hear anything. Please try again.");
                commandStatus = 'no_speech';
            } else if (event.error === 'not-allowed') {
                speak("Permission to use the microphone was denied. Please allow microphone access in your browser settings to use voice commands.");
                commandStatus = 'permission_denied';
            } else if (event.error === 'aborted' && alwaysListeningToggle.checked) {
                 console.log("Recognition aborted in continuous mode, restarting...");
                 if (alwaysListeningToggle.checked) {
                     recognition.start();
                 }
                 commandStatus = 'aborted'; // Special status for continuous mode restart
            } else {
                speak(`I'm having trouble understanding. Error: ${event.error}.`);
                commandStatus = 'error';
            }
            // GA4 Tracking: Voice Command Error
            gtag('event', 'voice_command', {
                'command_type': 'error',
                'command_status': commandStatus,
                'voice_commands_count': 1 // Track failed attempts too
            });

            setTimeout(() => {
                taraResponseBox.classList.add('hidden');
                taraResponseText.textContent = '';
            }, 3000);
        };

        recognition.onend = () => {
            taraMicButton.classList.remove('listening');
            taraMicButton.innerHTML = '<span class="emoji">🎤</span> Talk to Tara';
            if (alwaysListeningToggle.checked && !synth.speaking) {
                console.log("Recognition ended, restarting for always listening mode...");
                setTimeout(() => {
                    recognition.start();
                }, 100);
            }
        };
    }

    // Handle voice commands
    function handleVoiceCommand(command) {
        let commandType = 'unknown';
        let commandStatus = 'not_understood';
        let responseText = "I didn't quite catch that command. I can help with 'switch to dark mode', 'scroll to contact form', or 'play the video'.";

        if (command.includes('switch to dark mode')) {
            commandType = 'theme_change';
            if (body.classList.contains('light-mode')) {
                applyTheme('dark');
                responseText = "Okay, switching to dark mode. Enjoy the chill vibes!";
                commandStatus = 'success';
            } else {
                responseText = "We're already in dark mode, fam. Anything else?";
                commandStatus = 'already_dark';
            }
        } else if (command.includes('switch to light mode')) {
            commandType = 'theme_change';
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
                responseText = "Got it! Back to the bright side.";
                commandStatus = 'success';
            } else {
                responseText = "You're already glowing in light mode!";
                commandStatus = 'already_light';
            }
        } else if (command.includes('scroll to contact form') || command.includes('contact us')) {
            commandType = 'scroll_action';
            document.getElementById('contact-form-section').scrollIntoView({ behavior: 'smooth' });
            responseText = "Scrolling down to the contact form for you.";
            commandStatus = 'success';
        } else if (command.includes('play the video') || command.includes('play video')) {
            commandType = 'video_action';
            const videoFrame = document.querySelector('#featured-video iframe');
            if (videoFrame) {
                responseText = "Attempting to play the video. If it doesn't start, please click on it, browser privacy rules can be tricky!";
                commandStatus = 'success';
            } else {
                responseText = "Hmm, I don't see a video here. Maybe it's on another page?";
                commandStatus = 'video_not_found';
            }
        } else if (command.includes('hello tara') || command.includes('hey tara') || command.includes('hi tara')) {
            commandType = 'greeting';
            responseText = "Hey there! How can I help you vibe today?";
            commandStatus = 'success';
        } else if (command.includes('thank you') || command.includes('thanks tara')) {
            commandType = 'gratitude';
            responseText = "You got it! Always here to help.";
            commandStatus = 'success';
        }

        speak(responseText);

        // GA4 Tracking: Voice Command Handled
        gtag('event', 'voice_command', {
            'command_type': commandType,
            'command_status': commandStatus,
            'voice_commands_count': 1 // Custom metric for every command attempt
        });
    }

    // Event listener for mic button (Click-to-Talk)
    taraMicButton.addEventListener('click', () => {
        if (recognition) {
            if (!alwaysListeningToggle.checked) { // Only start if not in always listening mode
                recognition.start();
            } else {
                speak("I'm already in 'Always Listening' mode. Just speak your command!");
            }
        }
    });

    // Event listener for Always Listening toggle
    alwaysListeningToggle.addEventListener('change', () => {
        if (!recognition) return; // Exit if recognition not initialized

        if (alwaysListeningToggle.checked) {
            listeningModeLabel.textContent = 'Always Listening';
            recognition.continuous = true;
            speak("Okay, I'm now in always listening mode. Just say your command.");
            recognition.start(); // Start recognition when enabled
        } else {
            listeningModeLabel.textContent = 'Click-to-Talk';
            recognition.continuous = false;
            speak("Switched to click-to-talk mode. Click the mic button when you need me.");
            recognition.stop(); // Stop continuous recognition when disabled
        }
    });

    // Initialize speech recognition and welcome message when the page loads
    window.addEventListener('load', () => {
        initializeSpeechRecognition();
        // If always listening is enabled by default or saved preference, start it
        if (alwaysListeningToggle.checked) {
            recognition.start();
        }
        // A little welcome message from Tara
        setTimeout(() => {
            speak("Hey VibeZone fam! I'm Tara, your voice assistant. Try saying 'switch to dark mode'!");
        }, 2000); // Give a small delay after page load
    });
}); // End DOMContentLoaded
