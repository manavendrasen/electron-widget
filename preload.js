const { contextBridge, ipcRenderer } = require('electron');
const Store = require('electron-store');
const store = new Store();

console.log('Preload script loaded');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
	'electron', {
	minimize: () => {
		console.log('Minimize called');
		ipcRenderer.send('minimize-window');
	},
	close: () => {
		console.log('Close called');
		ipcRenderer.send('close-window');
	},

	// Store methods
	store: {
		get: (key) => {
			console.log('Store get:', key);
			return store.get(key);
		},
		set: (key, value) => {
			console.log('Store set:', key, value);
			store.set(key, value);
		},
		has: (key) => {
			console.log('Store has:', key);
			return store.has(key);
		},
		delete: (key) => {
			console.log('Store delete:', key);
			store.delete(key);
		},
		clear: () => {
			console.log('Store clear');
			store.clear();
		}
	}
}
); 