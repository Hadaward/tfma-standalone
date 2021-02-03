const path=require('path'),fs=require('fs'),zlib=require('zlib');

if (!String.prototype.replaceAll) String.prototype.replaceAll = function(v1, v2){return this.split(v1).join(v2)};

const Object_size = function(obj) {
	let size=0, key;
	for(key in obj)size++;
	return size;
};

const ValueParser = function(value, normalize) {
	if (!normalize) {
		if(typeof value==='object') return (typeof value)+'#'+JSON.stringify(value);
		else return (typeof value)+'#'+String(value);
	} else {
		let type=value.split('#')[0];
		value=value.substr(type.length+1);
		if (type=='object') return JSON.parse(value);
		else if (type=='boolean') return (value=='true');
		else if(type=='number') return Number(value);
		return value;
	}
}


const sl512 = {
	encode: function(str) {
		let r="";
		for(let k=0;k<str.length;k++)r+=String.fromCharCode(512+str.charCodeAt(k));
		return r;
	},
	
	decode: function(str) {
		let r="";
		for(let k=0;k<str.length;k++)r+=String.fromCharCode(str.charCodeAt(k)-512);
		return r;
	}
}

const read = function(pos, data) {
	const len = data.charCodeAt(pos);
	pos+=1;
	const result = sl512.decode(data.substr(pos, len));
	return [pos+len, result];
}

module.exports = {
	binpath: path.dirname(__dirname)+'\\',
	
	load: function(filepath, defaultConfig) {
		filepath=path.normalize(String(filepath).replaceAll('*#', this.binpath))+".dat";
		
		if (fs.existsSync(filepath)) {
			try {
				let pos=1,config={},data=(zlib.inflateSync(fs.readFileSync(filepath, {flag:'r+'})).toString('utf-8')),length=data.charCodeAt(0);
				while(Object.keys(config).length<length) {
					let key, value;
					[pos, key] = read(pos, data);
					[pos, value] = read(pos, data);
					config[key] = ValueParser(value, true);
				}
				return config;
			} catch(e) {
				this.save(filepath.split('.')[0], defaultConfig);
				return defaultConfig;
			}
		} else if (defaultConfig) {
			this.save(filepath.split('.')[0], defaultConfig);
			return defaultConfig;
		} else return null;
	},
	
	save: function(filepath, config) {
		let fpath=path.normalize(String(filepath).replaceAll('*#', this.binpath))+".dat",data="";
		data += String.fromCharCode(Object.keys(config).length);
		for (let k in config) {
			let k512=sl512.encode(String(k)), v512=sl512.encode(ValueParser(config[k]));
			data+=String.fromCharCode(k512.length)+k512+String.fromCharCode(v512.length)+v512;
		}
		fs.writeFileSync(fpath, zlib.deflateSync(data.toString('base64')));
	}
}