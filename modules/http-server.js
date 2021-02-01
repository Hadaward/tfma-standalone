const http=require('http'), request=require('request'), fs=require('fs'), path=require('path'), M={}, L={};

M.httpServer=null;
L.events = {};

M.mimeTypes = {
	'.html': 'text/html',
	'.js': 'text/javascript',
	'.swf': 'application/x-shockwave-flash',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.jpg': 'image/jpg',
	'.gif': 'image/gif',
	'.svg': 'image/svg+xml',
	'.wav': 'audio/wav',
	'.mp4': 'video/mp4',
	'.woff': 'application/font-woff',
	'.ttf': 'application/font-ttf',
	'.eot': 'application/vnd.ms-fontobject',
	'.otf': 'application/font-otf',
	'.wasm': 'application/wasm',
	'.xml': 'application/xml',
	'.mp3': 'audio/mpeg3'
};

M.on=(evt,c)=>L.events[evt]=c;
M.emit=(evt,...args)=>L.events[evt]&&L.events[evt](...args)||null;

M.createServer=function() {
	if (M.httpServer) M.httpServer.close();
	
	M.server = http.createServer(function (req, response) {
		const filepath = (req.url == "/" && "/index.html" || req.url).split('?')[0];
		
		if (req.url.endsWith('ProtoM801.js')||req.url.startsWith('/ressources')) {
			const extname=String(path.extname(filepath)).toLowerCase().split('?')[0], mime=M.mimeTypes[extname]||"application/octet-stream";
			let error;
			
			fs.readFile(__dirname+"/../media"+filepath, function(error, content) {
				if(!error) {
					content=M.emit('request', req, content)||content;
					response.writeHead(200, {'Content-Type':mime});
					response.end(content, 'utf-8');
					exists = true;
				} else error = error;
			});
			
			if (!error) return;
		}
		
		request({url:'http://transformice-adventures.com'+filepath, headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'}}, function (error, res, body) {
			if (error) throw error;
			body=M.emit('request', req, body)||body;
			response.writeHead(res.statusCode, res.headers);
			response.end(body);
		});
	});
	
	M.server.listen(801);
}

module.exports=M;