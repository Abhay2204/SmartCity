 // Configuration
        const CONFIG = {
            NETMIND_API_KEY: '1a42cca6df2646fdbfb5138c0ac7bf95',
            NETMIND_API_URL: 'https://api.netmind.ai/v1/chat/completions', // Replace with actual NetMind API endpoint
            OPENWEATHER_API_KEY: '193f10d41578f99cc6dc83bf2756228d',
            WAQI_API_KEY: '20206cea32865bf0a4a836a78be52f71e91c4bbe',
            NEWSDATA_API_KEY: 'pub_fef5a5bdc04445a8841977fb270afb95'
        };

        // DOM Elements
        const chatContainer = document.getElementById('chatContainer');
        const messageInput = document.getElementById('messageInput');
        const chatForm = document.getElementById('chatForm');
        const sendBtn = document.getElementById('sendBtn');
        const typingIndicator = document.getElementById('typingIndicator');
        const quickActionBtns = document.querySelectorAll('.quick-action');

        // Quick Actions
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const message = btn.getAttribute('data-message');
                messageInput.value = message;
                sendMessage();
            });
        });

        // Form Submit
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            sendMessage();
        });

        // Send Message Function
        async function sendMessage() {
            const message = messageInput.value.trim();
            if (!message) return;

            // Disable input and button
            messageInput.disabled = true;
            sendBtn.disabled = true;

            // Add user message
            addMessage(message, 'user');
            messageInput.value = '';

            // Show typing indicator
            showTypingIndicator();

            try {
                // Call NetMind API
                const response = await callNetMindAPI(message);
                
                // Hide typing indicator
                hideTypingIndicator();
                
                // Add bot response
                addMessage(response, 'bot');
                
            } catch (error) {
                console.error('Error:', error);
                hideTypingIndicator();
                addMessage('I apologize, but I\'m experiencing some technical difficulties. Please try again in a moment. If this is a medical emergency, please contact your local emergency services immediately.', 'bot');
            } finally {
                // Re-enable input and button
                messageInput.disabled = false;
                sendBtn.disabled = false;
                messageInput.focus();
            }
        }

        // Add Message to Chat
        function addMessage(text, sender) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;
            
            if (sender === 'user') {
                messageDiv.innerHTML = `
                    <div class="d-flex align-items-start justify-content-end">
                        <div class="text-end">
                            <strong>You</strong>
                            <p class="mb-0 mt-1">${text}</p>
                        </div>
                        <i class="bi bi-person-circle text-light ms-2 fs-5"></i>
                    </div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="d-flex align-items-start">
                        <i class="bi bi-robot text-primary me-2 fs-5"></i>
                        <div>
                            <strong>HealthBot</strong>
                            <div class="mt-1">${formatBotResponse(text)}</div>
                        </div>
                    </div>
                `;
            }
            
            chatContainer.appendChild(messageDiv);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        // Format Bot Response
        function formatBotResponse(text) {
            // Convert line breaks to HTML
            text = text.replace(/\n/g, '<br>');
            
            // Convert bullet points
            text = text.replace(/^\* (.+)$/gm, '<li>$1</li>');
            text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
            
            // Convert numbered lists
            text = text.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
            
            // Make important text bold
            text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            
            return text;
        }

        // Show/Hide Typing Indicator
        function showTypingIndicator() {
            typingIndicator.style.display = 'flex';
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }

        function hideTypingIndicator() {
            typingIndicator.style.display = 'none';
        }

        async function callNetMindAPI(userMessage) {
    const response = await fetch('/api/healthbot/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
    });

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.reply;
}


        // Get User Location (for finding nearby doctors)
        function getUserLocation() {
            return new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(resolve, reject);
                } else {
                    reject(new Error('Geolocation not supported'));
                }
            });
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            messageInput.focus();
            
            // Add welcome message interaction
            setTimeout(() => {
                const welcomeMessage = document.querySelector('.bot-message');
                if (welcomeMessage) {
                    welcomeMessage.style.animation = 'fadeIn 0.5s ease-in';
                }
            }, 500);
        });

        // Add some CSS animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .message {
                animation: fadeIn 0.3s ease-in;
            }
        `;
        document.head.appendChild(style);