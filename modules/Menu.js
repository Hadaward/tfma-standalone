const {Menu}=require('electron');

module.exports = class {
	constructor() {
		this.data = {};
		this.menu = null;
	}
	
	createMenu(id, label) {
		this.data[id] = {
			label: label,
			submenu: {}
		};
		return this;
	}
	
	createSubMenu(id, options) {
		if (this.data[id]) {
			let caller
			if (options.onclick) {
				let self = this;
				caller = function() {
					options.onclick(self);
				}
			}
			
			this.data[id].submenu[options.id] = {
				label: options.label,
				onclick: caller,
				shortcurt: options.shortcurt
			}
		}
		return this;
	}
	
	editMenuLabel(id, label) {
		if (this.data[id])this.data[id].label = label;
		return this;
	}
	
	editSubMenuLabel(id, sid, label) {
		if (this.data[id]&&this.data[id].submenu[sid])this.data[id].submenu[sid].label = label;
		return this;
	}
	
	removeMenu(id) {
		delete this.data[id];
		return this;
	}
	
	removeSubMenu(id, sid) {
		delete this.data[id].submenu[sid];
		return this;
	}
	
	build() {
		let template = [];
		for (let k in this.data) {
			let submenu = [];
			for (let s in this.data[k].submenu) submenu.push({label:this.data[k].submenu[s].label, click:this.data[k].submenu[s].onclick, accelerator:this.data[k].submenu[s].shortcurt});
			template.push({
				label: this.data[k].label,
				submenu: submenu.length>0&&submenu||null
			})
		}
		this.menu = Menu.buildFromTemplate(template);
		return this;
	}
	
	update() {
		Menu.setApplicationMenu(this.menu);
		return this;
	}
}