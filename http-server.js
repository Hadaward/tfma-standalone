const http = require('http'), requestlib = require('request'), fs = require('fs'), path = require('path');
const M = {};

M.server = null;

M.createServer = function() {
	if (M.server) M.server.close();
	
	M.server = http.createServer(function (request, response) {
		const filepath = (request.url == "/" && "/index.html" || request.url);
		const extname = String(path.extname(filepath)).toLowerCase().split('?')[0];

		var mimeTypes = {
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
		
		const mime = mimeTypes[extname]||"application/octet-stream";
		
		
		if (request.url.endsWith('ProtoM801.js')||request.url.startsWith('/ressources')) {
			let exists = false;
			
			fs.readFile(__dirname+"/media"+filepath.split('?')[0], function(error, content) {
				if(!error) {
					response.writeHead(200, {'Content-Type':mime});
					response.end(content, 'utf-8');
					exists = true;
				}
			});
			
			if (exists) return;
		}
		requestlib({url:'http://transformice-adventures.com/'+filepath.split('?')[0], headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'}}, function (error, res, body) {
			if (error) throw error;
			
			response.writeHead(res.statusCode, res.headers);
			response.end(body);
		});
	});
	
	M.server.listen(1024);
}

module.exports = M;