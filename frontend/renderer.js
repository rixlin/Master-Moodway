const { io } = require('socket.io-client');

// Connect using the Socket.IO protocol (matches backend/server.py)
const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
});

const petImg = document.getElementById('pet-img');
const speechBubble = document.getElementById('speech-bubble');

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

    displayMessage(text);
    
    // Optional: Trigger talking animation/state
    triggerTalkingState();
});

function displayMessage(text) {
    speechBubble.innerText = text;
    speechBubble.style.display = 'block';

    // Hide the bubble after 5 seconds
    setTimeout(() => {
        speechBubble.style.display = 'none';
    }, 5000);
}

function triggerTalkingState() {
    // Switch to your talking png/animation
    petImg.src = 'oogway-talking.png';
    
    // Switch back to idle after a delay
    setTimeout(() => {
        petImg.src = 'oogway-idle.gif';
    }, 3000);
}

// 4. Handle errors
socket.on('connect_error', (error) => {
    console.error('Socket.IO Connection Error:', error.message);
});