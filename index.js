const { app, BrowserWindow, session, Menu } = require('electron');
const http = require('./http-server');
const standalone = {};

standalone.window = () => {
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders["User-Agent"] = "Chrome";
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
	
	const window = new BrowserWindow({
		width: 1240,
		height: 660,
		webPreferences: {
			contextIsolation: true
		}
	});
	
	try {
		http.createServer();
	} catch(e) {};
	
	window.webContents.setVisualZoomLevelLimits(1, 5);
	window.loadURL("http://127.0.0.1:1024", {userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36"});
	standalone.setMenu(window);
}

standalone.setMenu = (window) => {
	const template = [
		{
			label: 'Game',
			submenu: [
				{
					label: 'Reload',
					click() {
						if (http.server) window.loadURL("http://127.0.0.1:1024");
					}
				},
				{
					label: 'Exit',
					click() {
						app.quit();
					}
				}
			]
		},
		{
			label: 'View',
			submenu: [
				{
					label: 'Zoom factor: '+window.webContents.getZoomFactor()
				},
				{
					label: 'Zoom In',
					click() {
						window.webContents.setZoomFactor(window.webContents.getZoomFactor() + 0.25);
						standalone.setMenu(window);
					},
					accelerator: 'Ctrl+Shift+='
				},
				{
					label: 'Zoom Out',
					click() {
						window.webContents.setZoomFactor(window.webContents.getZoomFactor() - 0.25);
						standalone.setMenu(window);
					},
					accelerator: 'Ctrl+-'
				}
			]
		}
	];
	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(standalone.window);
app.on('window-all-closed', () => process.platform!=='darwin'&&app.quit()||null);
app.on('activate', () => BrowserWindow.getAllWindows().length===0&&standalone.window()||null);