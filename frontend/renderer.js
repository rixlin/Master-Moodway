const { io } = require('socket.io-client');

const { ipcRenderer } = require('electron');

// Make the window ignore all mouse events
ipcRenderer.send('set-ignore-mouse', true);

// Connect using the Socket.IO protocol (matches backend/server.py)
const socket = io('http://localhost:6000', {
    transports: ['websocket']
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
const playCooldownMs = 15000;
let lastPlayAt = 0;
let currentAudio = null;
let isInCooldown = false;

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
    // console.log('Received message from backend:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Anger: ${anger.toFixed(2)}%`
        : (data?.message || 'Received update from backend');

    latestData.visual = data

    updateCrashOutBar();
    ifScoreThenTalk()
    // displayMessage(speechBubble, text);
});

// 3b. Handle audio anger messages
socket.on('audio_message', (data) => {
    // console.log('Received audio message:', data);
    const anger = data?.data;
    const text = typeof anger === 'number'
        ? `Audio anger: ${anger.toFixed(2)}`
        : (data?.message || 'Received audio update');

    latestData.audio = data

    updateCrashOutBar();
    ifScoreThenTalk();
    // displayMessage(audioBubble, text);
});

function ifScoreThenTalk(){
    const angerScore = getWeightedAngerScore();

    if (angerScore <= 0.60) {
        return false;
    }

    // Check the shared cooldown flag
    if (isInCooldown) {
        return false;
    }

    lastPlayAt = Date.now();
    isInCooldown = true;

    setSpeakingState(true);
    playRandomOogwayAudio();
    // Release cooldown after delay
    setTimeout(() => {
        isInCooldown = false;
    }, playCooldownMs);
    
    return true;
}

function updateCrashOutBar() {
    if (!crashOutFill) {
        return;
    }

    const rawScore = getWeightedAngerScore();
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

function getWeightedAngerScore() {
    const audioScore = getAngerScore(latestData.audio);
    const visualScore = getAngerScore(latestData.visual) * 0.01;
    return (audioScore * 0.6) + (visualScore * 0.4);
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

    const audio = new Audio(audioPath);
    currentAudio = audio;

    audio.addEventListener('ended', () => {
        if (currentAudio !== audio) {
            return;
        }
        setSpeakingState(false);
        currentAudio = null;
    });
    audio.addEventListener('error', () => {
        if (currentAudio !== audio) {
            return;
        }
        setSpeakingState(false);
        currentAudio = null;
    });

    audio.play().catch((error) => {
        console.error('Failed to play Oogway audio:', error);
        if (currentAudio !== audio) {
            return;
        }
        setSpeakingState(false);
        currentAudio = null;
    });
}

function setSpeakingState(isSpeaking) {
    petImg.src = isSpeaking
        ? './assets/images/oogway-pose06.png'
        : './assets/images/oogway-pose02.png';

    speechBubble.innerText = 'Moodway is talking...';
    speechBubble.style.display = isSpeaking ? 'block' : 'none';
}

// 4. Handle errors
socket.on('connect_error', (error) => {
    console.error('Socket.IO Connection Error:', error.message);
});