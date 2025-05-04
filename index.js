const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
	console.log('Creating window...');

	// Get the absolute path to the preload script
	const preloadPath = path.join(__dirname, 'preload.js');
	console.log('Preload script path:', preloadPath);

	mainWindow = new BrowserWindow({
		width: 300,
		height: 450,
		minWidth: 300,
		minHeight: 450,
		frame: false,
		transparent: true,
		alwaysOnTop: true,
		webPreferences: {
			nodeIntegration: true,  // Temporarily enable for debugging
			contextIsolation: true,  // Temporarily disable for debugging
			enableRemoteModule: true,  // Temporarily enable for debugging
			preload: preloadPath
		}
	});

	// Open DevTools for debugging
	// mainWindow.webContents.openDevTools();

	console.log('Loading index.html...');
	mainWindow.loadFile('index.html').catch(err => {
		console.error('Failed to load index.html:', err);
	});

	mainWindow.setAlwaysOnTop(true, 'status');
	mainWindow.setVisibleOnAllWorkspaces(true);

	// Performance optimizations
	mainWindow.setBackgroundThrottling(false);

	// Handle window controls
	ipcMain.on('minimize-window', () => {
		console.log('Minimize window received');
		mainWindow.minimize();
	});

	ipcMain.on('close-window', () => {
		console.log('Close window received');
		mainWindow.close();
	});

	// Log any errors from the renderer process
	mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
		console.log(`Renderer console [${level}]: ${message}`);
	});
}

// Optimize app startup
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

app.whenReady().then(() => {
	console.log('App is ready');
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
}); 