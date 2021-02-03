const {app, BrowserWindow, session}=require('electron'), path=require('path'), menu=require('./library/menu'), http=require('./library/http'), storage=require('./library/storage'), application={};

// *# refers to '__dirname' variable, loads the application settings, if there is an error loading or the file does not exist it is recreated.
application.settings=storage.load('*#ressources/settings', {
	debugMode: false,
	address: {
		host: '127.0.0.1',
		port: 8012
	},
	cache: {
		ports: {
			8012: -1,
			8013: -1,
			8014: -1,
			8015: -1,
			8016: -1
		}
	},
	zoomFactor: 1
});

// Helps manage the cache and check for available ports.
application.ports = {
	avaible: function(onlycount) {
		let count=0, k, na;
		for (k in application.settings.cache.ports) {
			if (!this.isRunning(k)) application.settings.cache.ports[k]=-1;
			if (application.settings.cache.ports[k]==-1) count+=1, na=k;
		}
		return !onlycount&&[na, count]||count;
	},
	
	getBusyByPID: (pid)=> {
		for (k in application.settings.cache.ports) {
			if (application.settings.cache.ports[k]==pid) return k;
		}
		return -1;
	},
	
	isRunning: (port)=> {try { process.kill(application.settings.cache.ports[port], 0); return true } catch (e) {return false}}
}

application.window=()=>{
	session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
		details.requestHeaders["User-Agent"]="Chrome";
		callback({cancel:false,requestHeaders:details.requestHeaders});
	});
	
	const window = new BrowserWindow({
		title: "Transformice Adventures",
		width: 1240,
		height: 660,
		webPreferences: {
			contextIsolation: true
		},
		icon: path.join(__dirname, "/ressources/souris."+(process.platform==='win32'&&'ico'||'png'))
	});
	
	window.webContents.setZoomFactor(application.settings.zoomFactor);
	
	application.menu=new menu(window)
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
		onclick: application.quit,
		shortcurt: 'ALT+F4'
	})
	.createMenu(2, "View")
	.createSubMenu(2, {
		id: 1,
		label: "Zoom factor: "+application.settings.zoomFactor
	})
	.createSubMenu(2, {
		id: 2,
		label: "Zoom In",
		onclick: ()=>application.zoomIn(window),
		shortcurt: 'CTRL+SHIFT+='
	})
	.createSubMenu(2, {
		id: 3,
		label: "Zoom Out",
		onclick: ()=>application.zoomOut(window),
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
		label: (application.settings.debugMode&&"Disable"||"Enable"),
		onclick: ()=>application.toggleDebugMode(window),
		shortcurt: 'CTRL+ALT+D'
	})
	.createMenu(5, "")
	.build()
	.update()
	
	if (application.ports.avaible(true)==0) window.loadURL("data:text/html;base64,PGh0bWw+Cgk8aGVhZD4KCQk8dGl0bGU+VHJhbnNmb3JtaWNlIEFkdmVudHVyZXMgLSBFcnJvcjwvdGl0bGU+CgkJPHN0eWxlPgoJCQlib2R5IHsKCQkJCWJhY2tncm91bmQtY29sb3I6ICMwMDAwMDA7CgkJCQl1c2VyLXNlbGVjdDogbm9uZTsKCQkJCWNvbG9yOiAjYjZjNmUwOwoJCQl9CgkJCWNlbnRlciB7CgkJCQlsZWZ0OiA1MCU7CgkJCQl0b3A6IDUwJTsKCQkJCXBvc2l0aW9uOiBhYnNvbHV0ZTsKCQkJCXRyYW5zZm9ybTogdHJhbnNsYXRlKC01MCUsIC01MCUpOwoJCQkJCgkJCQlmb250LXNpemU6IDI0cHg7CgkJCX0KCQk8L3N0eWxlPgoJPC9oZWFkPgoJCgk8Ym9keT4KCQk8Y2VudGVyPgoJCQlZb3UgY2Fubm90IG9wZW4gbW9yZSB0aGFuIDUgd2luZG93cy4KCQk8L2NlbnRlcj4KCTwvYm9keT4KPC9odG1sPg==")
	else {
		let [port, count] = application.ports.avaible()
		
		application.settings.cache.ports[port] = process.pid;
		application.settings.address.port = port;
		
		new http(application.settings.address)
		.on('ready', ()=>window.loadURL(`http://${application.settings.address.host}:${application.settings.address.port}/`, {userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36"}))
		.on('request', (request, body)=>{
			application.menu.editMenuLabel(5, "Loading "+request.baseurl).build().update();
			setTimeout(()=>BrowserWindow.getAllWindows().length>0&&application.menu.editMenuLabel(5, "").build().update(), 800);
			// This fix the game chat issue.
			if (request.url.endsWith('ProtoM801.js'))return body.replace('            this.ajouterPaquet(this.fusionCode(6, 6), function (MSG) {\n                var codeJoueur = MSG.l32s();\n                var auteur = MSG.lChaine();\n                var codeCommunaute = MSG.l8();\n                var message = MSG.lChaine();\n                message = message.replace(/&lt;/g, "<");\n                Module801_1.default.instance.messageChat(message, auteur, Communaute_1.default.recupParCode(codeCommunaute, Communaute_1.default.ANGLAIS_INT), 0);\n            });', '            this.ajouterPaquet(this.fusionCode(6, 6), function (MSG) {				\n				var auteur = MSG.lChaine();\n				var message = MSG.lChaine();\n                message = message.replace(/&lt;/g, "<");\n                Module801_1.default.instance.messageChat(message, auteur);\n            });'+(' '.repeat(202)));
			// This enable debug mode.
			if(request.url.endsWith('TFMAdventure.js')&&application.settings.debugMode)return body.replace('TFMAdventure.DEBUG = false;', 'TFMAdventure.DEBUG = true; ').replace('if (this.autorisationJoueur.estAdmin || TFMAdventure.DEBUG) {\n                Chips_1.Chips.afficher();\n            }', ' '.repeat(119)).replace('if (TFMAdventure.DEBUG) {\n                InterfaceOptionDebug_1.InterfaceOptionDebug.afficher();\n            }', ' '.repeat(109));
		});
	}
	
	storage.save('*#ressources/settings', application.settings);
}

application.zoomIn=(window)=>{
	if(application.settings.zoomFactor<5)application.settings.zoomFactor+=0.25;
	window.webContents.setZoomFactor(application.settings.zoomFactor);
	application.menu.editSubMenuLabel(2, 1, "Zoom factor: "+application.settings.zoomFactor).build().update();
	storage.save('*#ressources/settings', application.settings);
}

application.zoomOut=(window)=>{
	if(application.settings.zoomFactor>0)application.settings.zoomFactor-=0.25;
	window.webContents.setZoomFactor(application.settings.zoomFactor);
	application.menu.editSubMenuLabel(2, 1, "Zoom factor: "+application.settings.zoomFactor).build().update();
	storage.save('*#ressources/settings', application.settings);
}

application.toggleDebugMode=(window)=>{
	session.defaultSession.clearCache();
	application.settings.debugMode=!application.settings.debugMode;
	application.menu.editSubMenuLabel(4, 1, (application.settings.debugMode&&"Disable"||"Enable")).build().update();
	window.webContents.reload();
	storage.save('*#ressources/settings', application.settings);
}

application.quit=()=>{
	app.quit();
	
	let port = application.ports.getBusyByPID(process.pid);
	if (port>-1) application.settings.cache.ports[port] = -1;
	storage.save('*#ressources/settings', application.settings);
}

if (process.platform==='linux') app.commandLine.appendSwitch('no-sandbox');

app.whenReady().then(application.window);
app.on('window-all-closed', () => process.platform!=='darwin'&&application.quit()||null);
app.on('activate', () => BrowserWindow.getAllWindows().length===0&&application.window()||null);