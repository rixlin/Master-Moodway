const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 300,
    height: 300,
    transparent: true,      // Makes the background transparent
    frame: false,            // Removes title bar and borders
    alwaysOnTop: true,       // Keeps character above other windows
    resizable: false,
    skipTaskbar: true,       // Optional: hides it from the taskbar
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  win.loadFile('index.html');

  // Position it in the bottom right corner
  // You might want to calculate this based on screen size later
  win.setPosition(1600, 800); 

  // CRITICAL: This allows you to click "through" the transparent parts
  // We will toggle this based on mouse hover in the renderer
  ipcMain.on('set-ignore-mouse', (event, ignore, options) => {
    win.setIgnoreMouseEvents(ignore, options);
  });
}

app.whenReady().then(createWindow);