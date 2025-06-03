document.addEventListener('DOMContentLoaded', () => {
    // Array of website updates for Tara's "What's New?" command
    const websiteUpdates = [
        "Our fresh new VibeCheck Starter Pack is now available for download!",
        "Check out our latest video drop – it's pure fire!",
        "We've updated our contact form. Slide into our DMs with your thoughts!",
        "Tara, your chatbot, just got some new tricks! Try typing 'open menu' or 'what's new?'"
    ];

    // --- Theme Toggle Logic ---
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    // Check user's system preference for dark mode
    const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

    /**
     * Applies the specified theme (dark or light) to the body.
     * Updates localStorage and sends a GA4 event.
     * @param {string} theme - 'dark' or 'light'.
     */
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            body.classList.remove('light-mode');
            if (themeToggle) { // Ensure themeToggle exists
                themeToggle.innerHTML = '<span class="emoji">🌙</span> Dark Mode';
            }
            localStorage.setItem('theme', 'dark');
            // GA4 Tracking: Theme changed to Dark Mode
            gtag('event', 'theme_change', {
                'theme_mode': 'dark_mode'
            });
        } else {
            body.classList.add('light-mode');
            body.classList.remove('dark-mode');
            if (themeToggle) { // Ensure themeToggle exists
                themeToggle.innerHTML = '<span class="emoji">🌞</span> Light Mode';
            }
            localStorage.setItem('theme', 'light');
            // GA4 Tracking: Theme changed to Light Mode
            gtag('event', 'theme_change', {
                'theme_mode': 'light_mode'
            });
        }
    }

    // Apply saved theme or system preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else if (prefersDarkScheme.matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }

    // Event listener for theme toggle button
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            if (body.classList.contains('light-mode')) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        });
    }

    // --- "Join the Vibe" Button Click Tracking ---
    const joinButton = document.querySelector('#hero .genz-button');
    if (joinButton) {
        joinButton.addEventListener('click', () => {
            gtag('event', 'join_click', {
                'page_section': 'Hero', // Dimension
                'join_clicks': 1 // Metric
            });
        });
    }

    // --- Contact Form Submission Logic ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm && formMessage) {
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
    }

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
    const featuredVideoSection = document.getElementById('featured-video');
    if (videoFrame && featuredVideoSection) {
        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    gtag('event', 'video_view', {
                        'video_title': 'HOW GEN Z brain works 🧠😂'
                    });
                    videoObserver.unobserve(entry.target); // Only track once per page load
                }
            });
        }, {
            threshold: 0.5
        }); // Trigger when 50% of the video section is visible

        videoObserver.observe(featuredVideoSection);
    }

    // --- Side Menu Toggle Logic ---
    const hamburgerButton = document.getElementById('hamburger-menu');
    const sideMenu = document.getElementById('side-menu');
    const closeSideMenuButton = document.getElementById('close-side-menu');
    const sideMenuLinks = document.querySelectorAll('#side-menu ul li a'); // Get all links in side menu

    if (hamburgerButton && sideMenu && closeSideMenuButton) { // Ensure elements exist before adding listeners
        hamburgerButton.addEventListener('click', () => {
            sideMenu.classList.add('open');
            gtag('event', 'menu_interaction', {
                'menu_action': 'open_side_menu',
                'menu_location': 'header'
            });
        });

        closeSideMenuButton.addEventListener('click', () => {
            sideMenu.classList.remove('open');
            gtag('event', 'menu_interaction', {
                'menu_action': 'close_side_menu',
                'menu_location': 'header'
            });
        });

        // Close side menu when a link is clicked (for smooth scroll)
        sideMenuLinks.forEach(link => {
            link.addEventListener('click', () => {
                sideMenu.classList.remove('open');
                gtag('event', 'menu_interaction', {
                    'menu_action': 'click_side_menu_link',
                    'link_text': link.textContent,
                    'link_url': link.getAttribute('href')
                });
            });
        });

        // Close side menu if user clicks outside of it (optional, but good UX)
        document.addEventListener('click', (event) => {
            if (!sideMenu.contains(event.target) && !hamburgerButton.contains(event.target) && sideMenu.classList.contains('open')) {
                sideMenu.classList.remove('open');
                gtag('event', 'menu_interaction', {
                    'menu_action': 'close_side_menu_outside_click',
                    'menu_location': 'outside'
                });
            }
        });
    }


    // --- TARA CHATBOT LOGIC ---
    const taraToggleChatButton = document.getElementById('tara-toggle-chat-button');
    const taraChatWindow = document.getElementById('tara-chat-window');
    const taraChatHistory = document.getElementById('tara-chat-history');
    const taraTextInput = document.getElementById('tara-text-input');
    const taraSendButton = document.getElementById('tara-send-button');

    const synth = window.speechSynthesis; // Web Speech Synthesis API
    let chatHistory = []; // To store chat history for LLM context

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
                // No need to update taraResponseText or box directly for speech,
                // as messages are added to chat history.
            };
            utterance.onend = () => {
                // No specific action needed on end for speech, as messages are persistent in chat history.
            };
            utterance.onerror = (event) => {
                console.error('SpeechSynthesisUtterance.onerror', event);
            };
            synth.speak(utterance);
        }
    }

    // Function to find a suitable American female voice for Tara
    function getTaraVoice() {
        const voices = synth.getVoices();
        let taraVoice = voices.find(voice => voice.name === 'Google US English' && voice.lang === 'en-US' && voice.default) ||
            voices.find(voice => voice.name.includes('Google US English') && voice.lang === 'en-US') ||
            voices.find(voice => voice.name.includes('Samantha') && voice.lang === 'en-US') || // iOS/macOS voice
            voices.find(voice => voice.name.includes('Karen') && voice.lang === 'en-AU') || // Australian, but often sounds soft
            voices.find(voice => voice.lang === 'en-US' && voice.name.includes('Female'));

        if (!taraVoice) {
            taraVoice = voices.find(voice => voice.lang === 'en-US' && voice.default) ||
                voices.find(voice => voice.lang === 'en-US' && voice.gender === 'female') ||
                voices.find(voice => voice.lang === 'en-US');
        }
        return taraVoice || voices[0];
    }

    if (synth.onvoiceschanged !== undefined) {
        synth.onvoiceschanged = getTaraVoice;
    }

    /**
     * Adds a message to the chat history display.
     * @param {string} text - The message content.
     * @param {string} sender - 'user' or 'tara'.
     */
    function addMessageToChat(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        messageDiv.innerHTML = `<p>${text}</p>`;
        taraChatHistory.appendChild(messageDiv);
        // Scroll to the bottom to show the latest message
        taraChatHistory.scrollTop = taraChatHistory.scrollHeight;
    }

    /**
     * Displays a loading indicator in the chat.
     * @returns {HTMLElement} The loading indicator element.
     */
    function showLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('loading-indicator', 'tara-message'); // Use tara-message style for alignment
        loadingDiv.textContent = 'Tara is typing';
        taraChatHistory.appendChild(loadingDiv);
        taraChatHistory.scrollTop = taraChatHistory.scrollHeight;
        return loadingDiv;
    }

    /**
     * Removes a loading indicator from the chat.
     * @param {HTMLElement} indicator - The loading indicator element to remove.
     */
    function removeLoadingIndicator(indicator) {
        if (indicator && taraChatHistory.contains(indicator)) {
            taraChatHistory.removeChild(indicator);
        }
    }

    /**
     * Handles user input from the chat text box.
     * Processes commands or sends to LLM.
     * @param {string} inputText - The user's message.
     */
    async function handleUserInput(inputText) {
        const command = inputText.toLowerCase().trim();
        addMessageToChat(inputText, 'user');
        taraTextInput.value = ''; // Clear input field

        let commandHandled = false;
        let responseText = "I'm not sure how to respond to that. Can you try rephrasing?";
        let commandType = 'llm_query'; // Default to LLM query
        let commandStatus = 'success'; // Default for LLM unless error

        // --- Check for predefined commands first ---
        if (command.includes('switch to dark mode')) {
            applyTheme('dark');
            responseText = "Okay, switching to dark mode. Enjoy the chill vibes!";
            commandType = 'theme_change';
            commandHandled = true;
        } else if (command.includes('switch to light mode')) {
            applyTheme('light');
            responseText = "Got it! Back to the bright side.";
            commandType = 'theme_change';
            commandHandled = true;
        } else if (command.includes('scroll to contact form') || command.includes('contact us') || command.includes('go to contact')) {
            const contactSection = document.getElementById('contact-form-section');
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
                responseText = "Scrolling down to the contact form for you.";
                commandType = 'scroll_action';
                commandHandled = true;
            } else {
                responseText = "Hmm, I can't find the contact form section.";
                commandStatus = 'not_found';
            }
        } else if (command.includes('play the video') || command.includes('play video') || command.includes('go to video')) {
            const videoSection = document.getElementById('featured-video');
            if (videoSection) {
                videoSection.scrollIntoView({ behavior: 'smooth' });
                responseText = "Attempting to play the video. If it doesn't start, please click on it, browser privacy rules can be tricky!";
                commandType = 'video_action';
                commandHandled = true;
            } else {
                responseText = "Hmm, I don't see a video here. Maybe it's on another page?";
                commandStatus = 'video_not_found';
            }
        } else if (command.includes('what\'s new') || command.includes('latest updates')) {
            if (websiteUpdates.length > 0) {
                const randomUpdate = websiteUpdates[Math.floor(Math.random() * websiteUpdates.length)];
                responseText = `Here's something new: ${randomUpdate}`;
                commandType = 'info_request';
                commandHandled = true;
            } else {
                responseText = "Looks like there are no new updates right now, but stay tuned!";
                commandStatus = 'no_updates';
            }
        } else if (command.includes('go to hero') || command.includes('go to top') || command.includes('home section')) {
            const heroSection = document.getElementById('hero');
            if (heroSection) {
                heroSection.scrollIntoView({ behavior: 'smooth' });
                responseText = "Taking you to the top, where the good vibes begin!";
                commandType = 'navigation';
                commandHandled = true;
            } else {
                responseText = "I can't find the home section.";
                commandStatus = 'not_found';
            }
        } else if (command.includes('go to download') || command.includes('download section')) {
            const downloadSection = document.getElementById('download-stuff');
            if (downloadSection) {
                downloadSection.scrollIntoView({ behavior: 'smooth' });
                responseText = "Alright, heading to the digital goodies section!";
                commandType = 'navigation';
                commandHandled = true;
            } else {
                responseText = "I can't find the download section.";
                commandStatus = 'not_found';
            }
        } else if (command.includes('open menu') || command.includes('show menu') || command.includes('open side menu')) {
            if (sideMenu) {
                sideMenu.classList.add('open');
                responseText = "Opening the side menu for you.";
                commandType = 'navigation';
                commandHandled = true;
            } else {
                responseText = "I can't find the side menu to open it.";
                commandStatus = 'not_found';
            }
        } else if (command.includes('close menu') || command.includes('hide menu') || command.includes('close side menu')) {
            if (sideMenu) {
                sideMenu.classList.remove('open');
                responseText = "Closing the side menu.";
                commandType = 'navigation';
                commandHandled = true;
            } else {
                responseText = "There's no side menu open to close.";
                commandStatus = 'not_found';
            }
        } else if (command.includes('hello tara') || command.includes('hey tara') || command.includes('hi tara')) {
            responseText = "Hey there! How can I help you vibe today?";
            commandType = 'greeting';
            commandHandled = true;
        } else if (command.includes('thank you') || command.includes('thanks tara')) {
            responseText = "You got it! Always here to help.";
            commandType = 'gratitude';
            commandHandled = true;
        }


        if (commandHandled) {
            addMessageToChat(responseText, 'tara');
            speak(responseText);
            gtag('event', 'chat_command_executed', {
                'command_type': commandType,
                'command_status': commandStatus,
                'user_input': inputText
            });
        } else {
            // If no predefined command, send to LLM
            await getLLMResponse(inputText);
        }
    }

    /**
     * Calls the Gemini LLM to get a conversational response.
     * @param {string} prompt - The user's input prompt.
     */
    async function getLLMResponse(prompt) {
        const loadingIndicator = showLoadingIndicator(); // Show loading indicator

        // Initialize chatHistory with a system prompt for Tara's persona if it's the first message
        if (chatHistory.length === 0) {
            chatHistory.push({
                role: "system",
                parts: [{
                    text: "You are Tara, a friendly, enthusiastic, and helpful AI chatbot for VibeZone, a website focused on good vibes, Gen Z culture, and awesome digital content. Your goal is to be engaging, use positive language, and assist users with their queries about VibeZone, general topics, or just chat. You can also tell users about features like theme switching, the side menu, or content on the site (video, downloads, contact form). Keep your responses concise and fun."
                }]
            });
        }

        // Add user's message to chat history for LLM context
        chatHistory.push({
            role: "user",
            parts: [{
                text: prompt
            }]
        });

        const payload = {
            contents: chatHistory
        };
        const apiKey = ""; // Leave as empty string, Canvas will provide it
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const result = await response.json();
            removeLoadingIndicator(loadingIndicator); // Remove loading indicator

            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                const taraResponse = result.candidates[0].content.parts[0].text;
                addMessageToChat(taraResponse, 'tara');
                speak(taraResponse);
                // Add Tara's response to chat history for context
                chatHistory.push({
                    role: "model",
                    parts: [{
                        text: taraResponse
                    }]
                });

                gtag('event', 'llm_response', {
                    'status': 'success',
                    'user_input': prompt,
                    'response_length': taraResponse.length
                });

            } else {
                addMessageToChat("Oops! Tara is having a moment. Please try again later.", 'tara');
                speak("Oops! Tara is having a moment. Please try again later.");
                console.error("LLM response structure unexpected:", result);
                gtag('event', 'llm_response', {
                    'status': 'error',
                    'error_type': 'unexpected_response_structure',
                    'user_input': prompt
                });
            }
        } catch (error) {
            removeLoadingIndicator(loadingIndicator); // Remove loading indicator on error
            addMessageToChat("Looks like Tara's internet connection is on a break. Try again in a bit!", 'tara');
            speak("Looks like Tara's internet connection is on a break. Try again in a bit!");
            console.error("Error fetching LLM response:", error);
            gtag('event', 'llm_response', {
                'status': 'error',
                'error_type': 'fetch_error',
                'user_input': prompt,
                'error_message': error.message
            });
        }
    }

    // --- Event Listeners for Tara Chatbot ---
    if (taraToggleChatButton && taraChatWindow && taraTextInput && taraSendButton && taraChatHistory) {
        taraToggleChatButton.addEventListener('click', () => {
            taraChatWindow.classList.toggle('hidden');
            if (!taraChatWindow.classList.contains('hidden')) {
                taraTextInput.focus(); // Focus input when chat opens
                taraChatHistory.scrollTop = taraChatHistory.scrollHeight; // Scroll to bottom
                gtag('event', 'chat_interaction', {
                    'action': 'open_chat_window'
                });
            } else {
                gtag('event', 'chat_interaction', {
                    'action': 'close_chat_window'
                });
            }
        });

        taraSendButton.addEventListener('click', () => {
            const message = taraTextInput.value.trim();
            if (message) {
                handleUserInput(message);
            }
        });

        taraTextInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent new line in input
                const message = taraTextInput.value.trim();
                if (message) {
                    handleUserInput(message);
                }
            }
        });
    }

    // Initial welcome message from Tara when chat window is first shown or page loads
    // The welcome message is now part of the HTML structure, so no need for JS to add it initially.
    // However, if you want Tara to speak it on page load:
    // setTimeout(() => {
    //     speak("Hey VibeZone fam! I'm Tara, your chatbot. Type your questions or try typing 'switch to dark mode'!");
    // }, 2000);

}); // End DOMContentLoaded
