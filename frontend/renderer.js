const { io } = require('socket.io-client');

// Connect using the Socket.IO protocol (matches backend/server.py)
const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
});

const petImg = document.getElementById('pet-img');
const speechBubble = document.getElementById('speech-bubble');
const audioBubble = document.getElementById('audio-bubble');

// 2. Listen for successful Socket.IO connection
socket.on('connect', () => {
    console.log('Connected to Oogway Backend:', socket.id);
});

// 3. Handle incoming messages
socket.on('message', (data) => {
    console.log('Received message from backend:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Anger: ${anger.toFixed(2)}%`
        : (data?.message || 'Received update from backend');

    displayMessage(speechBubble, text);
    
    // Optional: Trigger talking animation/state
    triggerTalkingState();
});

// 3b. Handle audio anger messages
socket.on('audio_message', (data) => {
    console.log('Received audio message:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Audio anger: ${anger.toFixed(2)}`
        : (data?.message || 'Received audio update');

    displayMessage(audioBubble, text);
    triggerTalkingState();
});

function displayMessage(target, text) {
    target.innerText = text;
    target.style.display = 'block';

    // Hide the bubble after 5 seconds
    if (target.hideTimer) {
        clearTimeout(target.hideTimer);
    }
    target.hideTimer = setTimeout(() => {
        target.style.display = 'none';
        target.hideTimer = null;
    }, 5000);
}

function triggerTalkingState() {
    // Switch to your talking png/animation
    petImg.src = './assets/images/oogway-pose06.png';
    
    // Switch back to idle after a delay
    setTimeout(() => {
        petImg.src = './assets/images/oogway-pose02.png';
    }, 3000);
}

// 4. Handle errors
socket.on('connect_error', (error) => {
    console.error('Socket.IO Connection Error:', error.message);
});