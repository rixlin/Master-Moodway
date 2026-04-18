const { app, BrowserWindow, ipcMain, screen } = require('electron'); // Added screen
const path = require('path');

function createWindow() {
  // Get the primary display's dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  const winWidth = 300;
  const winHeight = 300;

  // Calculate coordinates: 
  // X = Total width minus window width
  // Y = Half of screen height minus half of window height
  const x = width - winWidth;
  const y = Math.floor((height - winHeight) / 2);

  const win = new BrowserWindow({
    width: winWidth,
    height: winHeight,
    x: x,
    y: y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,    // Allows using 'ws' in renderer.js
      contextIsolation: false   // Required if nodeIntegration is true
    },
  });

  win.loadFile('index.html');

  // Logic to handle mouse transparency (same as before)
  ipcMain.on('set-ignore-mouse', (event, ignore, options) => {
    win.setIgnoreMouseEvents(ignore, options);
  });
}

app.whenReady().then(createWindow);