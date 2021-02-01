const {app,BrowserWindow,session}=require('electron'), portscanner=require('portscanner'), path=require('path'), http=require('./modules/http-server'), Menu=require('./modules/Menu'), standalone={};

standalone.address = 'http://127.0.0.1:801';
standalone.debugMode = false;

standalone.window=()=>{
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
	
	window.webContents.setVisualZoomLevelLimits(1, 5);
	window.webContents.setZoomFactor(window.webContents.getZoomFactor());
	
	standalone.menu=(new Menu)
	.createMenu(1, "Game")
	.createSubMenu(1, {
		id: 1,
		label: "Reload",
		onclick: window.webContents.reload,
		shortcurt: 'CTRL+R'
	})
	.createSubMenu(1, {
		id: 2,
		label: "Exit",
		onclick: app.quit,
		shortcurt: 'ALT+F4'
	})
	.createMenu(2, "View")
	.createSubMenu(2, {
		id: 1,
		label: "Zoom factor: "+window.webContents.getZoomFactor()
	})
	.createSubMenu(2, {
		id: 2,
		label: "Zoom In",
		onclick: function(menu) {
			window.webContents.setZoomFactor(window.webContents.getZoomFactor()+0.25);
			menu.editSubMenuLabel(2, 1, "Zoom factor: "+window.webContents.getZoomFactor()).build().update();
		},
		shortcurt: 'CTRL+SHIFT+='
	})
	.createSubMenu(2, {
		id: 3,
		label: "Zoom Out",
		onclick: function(menu) {
			window.webContents.setZoomFactor(window.webContents.getZoomFactor()-0.25);
			menu.editSubMenuLabel(2, 1, "Zoom factor: "+window.webContents.getZoomFactor()).build().update();
		},
		shortcurt: 'CTRL+-'
	})
	.createMenu(3, "Cache")
	.createSubMenu(3, {
		id: 1,
		label: "Clear",
		onclick: ()=>session.defaultSession.clearCache(),
		shortcurt: 'CTRL+ALT+P'
	})
	.createMenu(4, "Debug")
	.createSubMenu(4, {
		id: 1,
		label: (standalone.debugMode&&"Disable"||"Enable"),
		onclick: (menu)=>{
			standalone.debugMode=!standalone.debugMode;
			menu.editSubMenuLabel(4, 1, (standalone.debugMode&&"Disable"||"Enable")).build().update();
			session.defaultSession.clearCache();
			window.webContents.reload();
		},
		shortcurt: 'CTRL+ALT+D'
	})
	.createMenu(5, "")
	.build()
	.update()
	
	portscanner.checkPortStatus(801, function(error, status) {
		if (status=='closed') http.createServer();
		window.loadURL(standalone.address, {userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36"})
	});
	
	http.on('request', (request, body)=>{
		standalone.menu.editMenuLabel(5, "Loading "+path.basename(request.url)+'...').build().update();
		setTimeout(()=>standalone.menu.editMenuLabel(5, "").build().update(), 800);
		
		if (standalone.debugMode) {
			if (request.url.endsWith('TFMAdventure.js')) {
				if(body.search('TFMAdventure.DEBUG = false;')>-1)return body.replace('TFMAdventure.DEBUG = false;', 'TFMAdventure.DEBUG = true; ').replace('if (this.autorisationJoueur.estAdmin || TFMAdventure.DEBUG) {\n                Chips_1.Chips.afficher();\n            }', ' '.repeat(119)).replace('if (TFMAdventure.DEBUG) {\n                InterfaceOptionDebug_1.InterfaceOptionDebug.afficher();\n            }', ' '.repeat(109));
			}
		}
	})
}

app.whenReady().then(standalone.window);
app.on('window-all-closed', () => process.platform!=='darwin'&&app.quit()||null);
app.on('activate', () => BrowserWindow.getAllWindows().length===0&&standalone.window()||null);