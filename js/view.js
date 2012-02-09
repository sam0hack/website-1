var view = function(id, controller, model, options){
	this.container = id && id.search ? document.getElementById(id) : id;
	this.sub_views = [];
	this.options = options;
	this.controller = controller;
	this.start_x = 0;
	this.start_y = 0;
	var header = this.container.querySelector("header");
	this.release = function(){
		if(this.will_release) this.will_release();
		if(this.model) this.model.unsubscribe(this);
		this.model = null;
		var i = 0;
		var ubounds = this.sub_views.length-1;
		for(i=0;i<ubounds;i++){
			this.sub_views[i].release();
		}
		this.hide();
	};
	this.serialize = function(form){
		var tags = {input: null, select: null, textarea: null};
		var data = [];
		for(tag in tags){
			var fields = form.querySelectorAll(tag);
			if(fields.length > 0){
				var i = 0;
				var ubounds = fields.length;
				for(i; i < ubounds; i++){
					var f = new field(fields[i]);
					var v = f.serialize();
					if(v === null) continue;
					data.push(v);
				}
			}
		}
		return data.join("&");
	};
	this.__defineGetter__("z", function(){
		return this.container.style["z-index"];
	});
	this.__defineSetter__("z", function(v){
		this.container.style["z-index"] = v;
	});
	this.__defineGetter__("top", function(){
		return parseInt(this.container.style.top.replace("px", ""));
	});
	this.__defineSetter__("top", function(v){
		this.container.style.top = v + "px";
	});
	this.__defineGetter__("left", function(){
		return parseInt(this.container.style.left.replace("px", ""));
	});
	this.__defineSetter__("left", function(v){
		this.container.style.left = v + "px";
	});
	this.__defineGetter__("header", function(){
		return header;
	});
	this.__defineGetter__("hidden", function(){
		return this.container.style.display === "none";
	});
	this.__defineSetter__("hidden", function(v){
		this.container.style.display = v ? "none" : "block";
	});
	this.__defineGetter__("is_editing", function(){
		return this.container.className.indexOf(" edit") > -1;
	});
	this.__defineGetter__("title", function(){
		return header.innerHTML;
	});
	this.__defineSetter__("title", function(v){
		header.innerHTML = v;
	});
	this.__defineGetter__("model", function(){
		return model;
	});
	this.__defineSetter__("model", function(v){
		model = v;
	});
	this.set_editing = function(flag, animated){
		if(flag){
			var c = this.container.className.split(" ");
			c.push("edit");
			this.container.className = c.join(" ");
		}else{
			this.container.className = this.container.className.replace(/\s?edit\s?/, "");
		}
	};
	this.add_view = function(view){
		this.sub_views.push(view);
	};
	this.show = function(delegate){
		if(delegate) return delegate(this);
		this.container.style.display = "block";
	};
	this.hide = function(delegate){
		if(delegate) return delegate(this);
		this.container.style.display = "none";
	};
	this.add_class_name = function(elem, name){
		if(elem.className.indexOf(name) === -1){
			var names = this.container.className.split(" ");
			names.push(name);
			elem.className = names.join(" ");
		}
	};
	this.remove_class_name = function(elem, name){
		if(elem.className.indexOf(name) > -1){
			var names = elem.className.split(" ");
			var new_ones = [];
			while(class_name = names.shift()){
				if(class_name === name) continue;
				new_ones.push(name);
			}
			elem.className = new_ones.join(" ");
		}
	}
	return this;
}
function field(elem){
	this.elem = elem;
	return this;
}
field.prototype.serialize = function(){
	if(this.elem.type === "checkbox" && !this.value()) return null;
	return this.elem.name + "=" + this.value();				
};
field.prototype.value = function(){
	if(this.elem.type === "checkbox") return this.elem.checked;
	if(this.elem.type === "select") return this.elem.options[this.elem.selectedIndex];
	return this.elem.value;
};

