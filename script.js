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
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<span class="emoji">🌞</span> Light Mode';
            localStorage.setItem('theme', 'light');
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

    // --- Contact Form Submission ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email regex

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
        }

        formMessage.classList.remove('hidden'); // Ensure message is visible

        // Hide message after a few seconds
        setTimeout(() => {
            formMessage.classList.add('hidden');
        }, 5000);
    });

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
            if (event.error === 'no-speech') {
                speak("Sorry, I didn't hear anything. Please try again.");
            } else if (event.error === 'not-allowed') {
                speak("Permission to use the microphone was denied. Please allow microphone access in your browser settings to use voice commands.");
            } else if (event.error === 'aborted' && alwaysListeningToggle.checked) {
                 // This can happen if recognition stops itself in continuous mode
                 // We want to restart if it's always listening
                 console.log("Recognition aborted in continuous mode, restarting...");
                 if (alwaysListeningToggle.checked) {
                     recognition.start(); // Restart if in always-listening
                 }
            } else {
                speak(`I'm having trouble understanding. Error: ${event.error}.`);
            }
            setTimeout(() => {
                taraResponseBox.classList.add('hidden');
                taraResponseText.textContent = '';
            }, 3000);
        };

        recognition.onend = () => {
            taraMicButton.classList.remove('listening');
            taraMicButton.innerHTML = '<span class="emoji">🎤</span> Talk to Tara';
            // Only restart if in always-listening mode AND not currently speaking
            if (alwaysListeningToggle.checked && !synth.speaking) {
                console.log("Recognition ended, restarting for always listening mode...");
                // Add a small delay before restarting to prevent rapid restarts if an error occurs
                setTimeout(() => {
                    recognition.start();
                }, 100);
            }
        };
    }

    // Handle voice commands
    function handleVoiceCommand(command) {
        if (command.includes('switch to dark mode')) {
            if (body.classList.contains('light-mode')) {
                applyTheme('dark');
                speak("Okay, switching to dark mode. Enjoy the chill vibes!");
            } else {
                speak("We're already in dark mode, fam. Anything else?");
            }
        } else if (command.includes('switch to light mode')) {
            if (body.classList.contains('dark-mode')) {
                applyTheme('light');
                speak("Got it! Back to the bright side.");
            } else {
                speak("You're already glowing in light mode!");
            }
        } else if (command.includes('scroll to contact form') || command.includes('contact us')) {
            document.getElementById('contact-form-section').scrollIntoView({ behavior: 'smooth' });
            speak("Scrolling down to the contact form for you.");
        } else if (command.includes('play the video') || command.includes('play video')) {
            const videoFrame = document.querySelector('#featured-video iframe');
            if (videoFrame) {
                // Note: Autoplay might be blocked by browsers, but this is the intent.
                speak("Attempting to play the video. If it doesn't start, please click on it, browser privacy rules can be tricky!");
            } else {
                speak("Hmm, I don't see a video here. Maybe it's on another page?");
            }
        } else if (command.includes('hello tara') || command.includes('hey tara') || command.includes('hi tara')) {
            speak("Hey there! How can I help you vibe today?");
        } else if (command.includes('thank you') || command.includes('thanks tara')) {
            speak("You got it! Always here to help.");
        } else {
            speak("I didn't quite catch that command. I can help with 'switch to dark mode', 'scroll to contact form', or 'play the video'.");
        }
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
