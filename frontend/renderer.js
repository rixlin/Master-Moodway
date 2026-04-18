const WebSocket = require('ws');

// 1. Connect to your Backend (Python/FastAPI/etc)
const socket = new WebSocket('ws://localhost:8765');

const petImg = document.getElementById('pet-img');
const speechBubble = document.getElementById('speech-bubble');

// 2. Listen for the connection to open
socket.on('open', () => {
    console.log('Connected to Oogway Backend');
});

// 3. Handle incoming messages
socket.on('message', (data) => {
    // Assuming your backend sends JSON: { "emotion": "sad", "message": "Inner peace..." }
    const response = JSON.parse(data);

    displayMessage(response.message);
    
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
socket.on('error', (error) => {
    console.error('WebSocket Error:', error);
});