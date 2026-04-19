const { io } = require('socket.io-client');

// Connect using the Socket.IO protocol (matches backend/server.py)
const socket = io('http://localhost:5000', {
    transports: ['websocket', 'polling']
});

const petImg = document.getElementById('pet-img');
const speechBubble = document.getElementById('speech-bubble');
const audioBubble = document.getElementById('audio-bubble');
const crashOutFill = document.getElementById('crash-out-fill');
const audioFiles = [
    'oogway-audio01.mp3',
    'oogway-audio02.mp3',
    'oogway-audio03.mp3',
    'oogway-audio04.mp3',
    'oogway-audio05.mp3',
    'oogway-audio06.mp3',
    'oogway-audio07.mp3',
    'oogway-audio08.mp3',
    'oogway-audio09.mp3',
    'oogway-audio10.mp3'
];
const audioBasePath = './assets/audio/';
const playCooldownMs = 20000;
let lastPlayAt = 0;
let currentAudio = null;

// 2. Listen for successful Socket.IO connection
socket.on('connect', () => {
    console.log('Connected to Oogway Backend:', socket.id);
});

const latestData = {
    visual: null,
    audio: null
};

// 3. Handle incoming messages
socket.on('message', (data) => {
    console.log('Received message from backend:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Anger: ${anger.toFixed(2)}%`
        : (data?.message || 'Received update from backend');

    latestData.visual = data

    updateCrashOutBar();
    ifScoreThenTalk()
    // displayMessage(speechBubble, text);
    
    // Optional: Trigger talking animation/state
    // triggerTalkingState();
});

// 3b. Handle audio anger messages
socket.on('audio_message', (data) => {
    console.log('Received audio message:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Audio anger: ${anger.toFixed(2)}`
        : (data?.message || 'Received audio update');

    latestData.audio = data

    updateCrashOutBar();
    ifScoreThenTalk();
    // displayMessage(audioBubble, text);
    // triggerTalkingState();
});

function ifScoreThenTalk(){
    const audioScore = getAngerScore(latestData.audio);
    const visualScore = getAngerScore(latestData.visual);
    const angerScore = audioScore + visualScore;

    if (angerScore <= 0.50) {
        return false;
    }

    const now = Date.now();
    if (now - lastPlayAt < playCooldownMs) {
        return false;
    }

    lastPlayAt = now;
    playRandomOogwayAudio();
    return true;
}

function updateCrashOutBar() {
    if (!crashOutFill) {
        return;
    }

    const audioScore = getAngerScore(latestData.audio);
    const visualScore = getAngerScore(latestData.visual);
    const rawScore = audioScore + visualScore;
    const normalized = clamp(rawScore, 0, 1);

    crashOutFill.style.height = `${(normalized * 100).toFixed(1)}%`;
}

function getAngerScore(payload) {
    if (!payload) {
        return 0;
    }

    const value = payload?.data;
    return typeof value === 'number' ? value : 0;
}

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

function playRandomOogwayAudio() {
    const filename = audioFiles[Math.floor(Math.random() * audioFiles.length)];
    const audioPath = `${audioBasePath}${filename}`;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }

    currentAudio = new Audio(audioPath);
    currentAudio.play().catch((error) => {
        console.error('Failed to play Oogway audio:', error);
    });
}

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