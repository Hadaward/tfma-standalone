const http=require('http'), requestlib=require('request'), pscn=require('portscanner'), fs=require('fs'), path=require('path');

module.exports = (class {
	constructor(address) {
		this.address = address;
		
		this.mimeTypes = {
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
		this.events = {};
		
		this.server = null;
		
		pscn.checkPortStatus(this.address.port, (e,s)=>(s=='closed')&&this.start()||null);
	}
	
	start() {
		let instance=this;
		this.server = http.createServer(function (request, response) {
			const filename=(request.url=="/"&&"/index.html"||request.url).split('?')[0];
			
			request.baseurl=path.basename(filename)
			
			if (filename.startsWith('/ressources')) {
				let exists, mime=instance.mimeTypes[path.extname(filename).toLowerCase()]||"application/octet-stream";
				fs.readFile(path.normalize(__dirname+"/.."+filename), function(error, body) {
					if(!error) {
						response.writeHead(200, {'Content-Type':mime});
						response.end(instance.emit('request', request, body)||body, 'utf-8');
						exists=true;
					}
				});
				if (exists) return;
			}
			
			requestlib({url:'http://transformice-adventures.com'+filename, headers:{'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.104 Safari/537.36'}}, function (error, res, body) {
				if (error) throw error;
				response.writeHead(res.statusCode, res.headers);
				response.end(instance.emit('request', request, body)||body, 'utf-8');
			});
		})
		this.server.listen(this.address.port, this.address.host||null, ()=>this.emit('ready'));
	}
	
	stop() {
		if(this.server)this.server.close(),this.server=null;
	}
	
	on(e,c) {
		this.events[e]=c;
		return this;
	}
	
	emit(e,...a){
		return this.events[e]&&this.events[e](...a)||null;
	}
})