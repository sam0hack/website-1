(function(){
	if(!window.localStorage.justjavascriptmvc) window.localStorage.justjavascriptmvc = JSON.stringify({settings: {persist: false}, todos: []});
	var storage = {
		settings: function(value){
			if(value){
				var justjavascriptmvc = JSON.parse(window.localStorage.justjavascriptmvc);
				justjavascriptmvc.settings = value;
				window.localStorage.justjavascriptmvc = JSON.stringify(justjavascriptmvc);
				return value;
			}
			var s = JSON.parse(window.localStorage.justjavascriptmvc).settings;
			var obj = new settings();
			obj.persist = s.persist;
			return obj;
		}
		, todos: function(){
			var list = JSON.parse(window.localStorage.justjavascriptmvc).todos;
			return list;
		}
		, add_todo: function(t){
			var todos = this.todos();
			todos.push(t);
			var justjavascriptmvc = JSON.parse(window.localStorage.justjavascriptmvc);
			justjavascriptmvc.todos = todos;
			window.localStorage.justjavascriptmvc = JSON.stringify(justjavascriptmvc);
		}
		, remove_todo: function(t){
			var todos = this.todos();
			for(i in todos){
				if(t.timestamp === parseInt(todos[i].timestamp)){
					todos.splice(i, 1);
					break;
				}
			}
			var justjavascriptmvc = JSON.parse(window.localStorage.justjavascriptmvc);
			justjavascriptmvc.todos = todos;
			window.localStorage.justjavascriptmvc = JSON.stringify(justjavascriptmvc);
		}
		, save: function(todos){
			var justjavascriptmvc = JSON.parse(window.localStorage.justjavascriptmvc);
			justjavascriptmvc.todos = todos;
			window.localStorage.justjavascriptmvc = JSON.stringify(justjavascriptmvc);
		}
		, save_todo: function(t){
			var todos = this.todos();
			for(var i = 0; i < todos.length; i++){
				if(t.timestamp === parseInt(todos[i].timestamp)){
					todos[i] = t;
					break;
				}
			}
			var justjavascriptmvc = JSON.parse(window.localStorage.justjavascriptmvc);
			justjavascriptmvc.todos = todos;
			window.localStorage.justjavascriptmvc = JSON.stringify(justjavascriptmvc);
		}
	};

	function model(){
		var dependents = [];
		this.subscribe = function(key, subscriber){
			if(dependents[key] === undefined) dependents[key] = [];
			dependents[key].push(subscriber);
		};
		this.unsubscribe = function(subscriber){
			var i = 0;
			var ubounds = dependents.length;
			for(i; i<ubounds; i++){
				var k = 0;
				var upper = dependents[i].length;
				for(k = 0; k < upper; k++){
					if(dependents[i][k] === subscriber){
						dependents[i].splice(k, 1);
						if(dependents[i].length === 0) delete dependents[i];
						break;
					}
				}
			}
		};
		this.changed = function(key, old, v){
			if(dependents[key] === undefined) return;
			var i = 0;
			var ubounds = dependents[key].length;
			for(i; i<ubounds; i++){
				dependents[key][i].update(key, old, v, this);
			}
		}
	}
	function todo(obj){
		model.apply(this, []);
		if(!obj) obj = {};
		var timestamp = obj.timestamp ? obj.timestamp : (new Date()).getTime();
		this.__defineGetter__("timestamp", function(){
			return timestamp;
		});
		this.__defineSetter__("timestamp", function(v){
			var old = timestamp;
			timestamp = v;
			this.changed("timestamp", old, v);
		});
		var order = obj.order ? obj.order : 0;
		this.__defineGetter__("order", function(){
			return order;
		});
		this.__defineSetter__("order", function(v){
			var old = order;
			order = v;
			this.changed("order", old, v);
		});
		var done = obj.done ? obj.done : false;
		this.__defineGetter__("done", function(){
			return done;
		});
		this.__defineSetter__("done", function(v){
			var old = done;
			done = v;
			this.changed("done", old, v);
		});
		var editing = obj.editing ? obj.editing : false;
		this.__defineGetter__("editing", function(){
			return editing;
		});
		this.__defineSetter__("editing", function(v){
			var old = editing;
			editing = v;
			this.changed("editing", old, v);
		});
		var content = obj.content ? obj.content : null;
		this.__defineGetter__("content", function(){
			return content;
		});
		this.__defineSetter__("content", function(v){
			var old = content;
			content = v;
			this.changed("content", old, v);
		});
		return this;
	}
	function settings(){
		model.apply(this, []);
		this.persist = false;
		return this;
	}
	
	/*Controllers namespace*/
	var DEVICE = (function(){
		var self = {};
		self.CANTOUCH = ("createTouch" in document);
		self.MOUSEDOWN = self.CANTOUCH ? "touchstart" : "mousedown";
		self.MOUSEMOVE = self.CANTOUCH ? "touchmove" : "mousemove";
		self.MOUSEUP = self.CANTOUCH ? "touchend" : "mouseup";
		self.CLICK = "click";
		self.DOUBLECLICK = "dblclick";
		self.KEYUP = "keyup";
		self.SEARCH = "search";
		self.INPUT = "input";
		self.BLUR = "blur";
		self.UNLOAD = "unload";
		self.CHANGE = "change";
		self.SCROLL = "scroll";
		self.FOCUS = "focus";
		self.SUBMIT = "submit";
		return self;
	})();
	/*List controller*/
	var controllers = {};
	controllers.list = function(){
		var view = null;
		var model = null;
		var self = this;
		var mouseDownDelegate = function(e){self[DEVICE.MOUSEDOWN](e);};
		var mouseUpDelegate = function(e){self[DEVICE.MOUSEUP](e);};
		var mouseMoveDelegate = function(e){self[DEVICE.MOUSEMOVE](e);};
		this.settings = null;
		this.isSwiping = false;
		var startY = 0;
		var startX = 0;
		var timer = null;
		var xVelocity = 0;
		var calculating = false;
		var previousTime = null;
		var shouldDelete = false;
		this[DEVICE.MOUSEDOWN] = function(e){
			this.isSwiping = true;
			startY = e.targetTouches ? e.targetTouches[0].pageY : e.pageY;
			startX = e.targetTouches ? e.targetTouches[0].pageY : e.pageX;
			timer = (new Date()).getTime();
			previousTime = timer;
			view.container.addEventListener(DEVICE.MOUSEMOVE, mouseMoveDelegate, true);
		};
		this[DEVICE.MOUSEUP] = function(e){
			this.isSwiping = false;
			view.container.removeEventListener(DEVICE.MOUSEMOVE, mouseMoveDelegate, true);
			timer = null;
			previousTime = null;
			if(shouldDelete && e.target && e.target.id && e.target.nodeName === "INPUT"){
				var todo = this.model.find(parseInt(e.target.id));
				this.model.pop(todo);
				if(this.settings.persist) storage.save(this.model.items());
			}
		};
		this[DEVICE.MOUSEMOVE] = function(e){
			if(calculating) return;
			calculating = true;
			var yDeviation = e.pageY - startY;
			var xDeviation = Math.abs(e.pageX - startX);
			var now = (new Date()).getTime();
			var previousXVelocity = xVelocity;
			xVelocity = xDeviation / (now-timer);
			var rate = Math.abs(xVelocity - previousXVelocity) / (now-previousTime);
			console.log([xDeviation > 160, rate > .009]);
			if(xDeviation > 160 && e.target && e.target.id && e.target.nodeName === "INPUT" && rate > .01){
				shouldDelete = true;
			}
			calculating = false;
			previousTime = now;
		};
		
		
		this.__defineGetter__("view", function(){
			return view;
		});
		this.__defineSetter__("view", function(v){
			if(view) view.release();
			view = v;
			view.container.addEventListener("blur", this, true);
			view.container.addEventListener("keypress", this, true);
			view.container.addEventListener("click", this, true);
			view.container.addEventListener(DEVICE.MOUSEDOWN, mouseDownDelegate, true);
			view.container.addEventListener(DEVICE.MOUSEUP, mouseUpDelegate, true);
			model = v.model;
			this.settings = v.settings;
			if(model.length() > 0){
				for(i in model.items()){
					view.add(model.item(i));
				}
				view.update_stats(model.length());
			}
		});
		this.__defineGetter__("model", function(){
			return model;
		});
		this.__defineSetter__("model", function(v){
			model = v;
		});
		return this;
	};
	controllers.list.prototype = {
		save: function(id, value){
			for(var i = 0; i < this.model.length(); i++){
				if(id === this.model.item(i).timestamp){
					this.model.item(i).content = value;
					if(this.settings.persist){
						storage.save_todo(this.model.item(i));
					}
					break;
				}
			}
		}
		, handleEvent: function(e){
			if(this[e.type]) this[e.type](e);
		}
		, blur: function(e){
			this.save(parseInt(e.target.id), e.target.value);
		}
		, keypress: function(e){
			if(e.which !== 13) return;
			this.view.select_next(e.target);
		}
		, click: function(e){
			if(e.target.type && e.target.type === "submit"){
				var todo = this.model.find(parseInt(e.target.id.replace("done_", "")));
				todo.done = !todo.done;
				if(this.settings.persist) storage.save_todo(todo);
			}
		}
	};
	/*Editing controller*/
	controllers.editing = function(){
		var view = null;
		var model = null;
		this.settings = null;
		this.__defineGetter__("view", function(){
			return view;
		});
		this.__defineSetter__("view", function(v){
			if(view) view.release();
			v.add_button.addEventListener("click", this, true);
			v.field.addEventListener("keypress", this, true);
			view = v;
			model = v.model;
			this.settings = v.settings;
		});
		this.__defineGetter__("model", function(){
			return model;
		});
		this.__defineSetter__("model", function(v){
			model = v;
		});
		this.release = function(v){
			view = null;
		};
		return this;
	};
	controllers.editing.prototype.handleEvent = function(e){
		if(this.view.value.length === 0) return;
		if(this[e.type]) this[e.type](e);
	};
	controllers.editing.prototype.add = function(value){
		var t = new todo();
		t.order = this.model.length();
		t.content = value;
		this.model.push(t);
		if(this.settings.persist){
			storage.add_todo(t);
		}
	};
	controllers.editing.prototype.keypress = function(e){
		if(e.which !== 13) return;
		this.add(this.view.value);
		e.target.value = "";
	};
	controllers.editing.prototype.click = function(e){
		if(e.target !== this.view.add_button) return;
		this.add(this.view.value);
		this.view.value = "";
		this.view.focus();
	};

	controllers.settings = function(){
		var view = null;
		var model = null;
		this.__defineGetter__("view", function(){
			return view;
		});
		this.__defineSetter__("view", function(v){
			if(view) view.release();
			v.checkbox.addEventListener("click", this, true);
			view = v;
			model = v.model;
		});
		this.release = function(v){
			view = null;
		};
		return this;
	};
	controllers.settings.prototype.handleEvent = function(e){
		if(this[e.type]) this[e.type](e);
	};
	controllers.settings.prototype.click = function(e){
		this.model.persist = this.view.value;
		storage.settings(this.model);
	};
	
	/*parent view*/
	function view(id, model, controller){
		this.container = document.getElementById(id);
		this.model = model;
		this.controller = controller;
		this.release = function(){
			this.controller.release(this);
			this.model.unsubscribe(this);
		};
		return this;
	}
	
	/*views namespace*/
	var views = {};
	views.editing = function(id, model, controller){
		view.apply(this, [id, model, controller]);
		this.__defineGetter__("field", function(){
			return field;
		});
		this.__defineGetter__("value", function(){
			return field.value;
		});
		this.__defineSetter__("value", function(v){
			field.value = v;
		});

		var field = this.container.querySelector("input");
		this.add_button = this.container.querySelector("#add_button");
		this.model = model.list;
		this.settings = model.settings;
		this.model.subscribe("todos.push", this);
		this.model.subscribe("todos.pop", this);
		this.controller.view = this;
		this.controller.model = this.model;					
		
		// Define as priveleged so we can keep the field property private.
		this.focus = function(){
			field.focus();
		};
		return this;
	}
	views.editing.prototype.update = function(key, old, v, m){
		if(this[key] === undefined) return;
		this[key](old, v, m);
	};
	
	/*list view*/
	views.list = function(id, model, controller){
		this.__defineGetter__("value", function(){
			return this.container.querySelector("input:focus").value;
		});
		this.__defineSetter__("value", function(v){
			this.container.querySelector("input:focus").value = v;
		});
		view.apply(this, [id, model, controller]);
		this.stats = document.getElementById("todo-stats");
		this.model = model.list;
		this.settings = model.settings;
		this.model.subscribe("todos.push", this);
		this.model.subscribe("todos.pop", this);
		var ubounds = this.model.length();
		var i = 0;
		for(i=0; i < ubounds; i++){
			this.model.item(i).subscribe("done", this);
		}
		this.controller.view = this;
		this.controller.model = this.model;
		return this;
	}
	views.list.prototype.select_next = function(elem){
		var li = elem.parentNode;
		var items = this.container.querySelectorAll("li");
		var i = 0;
		var item = null;
		for(i = 0; i < items.length - 1; i++){
			if(li === items[i]){
				item = items[i+1];
			}
		}
		if(item === null) return;
		item.querySelector("input[type='text']").focus();
	}
	views.list.prototype.update = function(key, old, v, m){
		if(this[key] === undefined) return;
		this[key](old, v, m);
	};
	views.list.prototype.remove = function(todo){
		var elements = this.container.querySelectorAll('li input[type="text"]');
		for(i in elements){
			if(parseInt(elements[i].id) === todo.timestamp){
				this.container.removeChild(elements[i].parentNode);
				break;
			}
		}
	};
	views.list.prototype.add = function(todo){
		var item = document.createElement("li");
		var field = document.createElement("input");
		var doneButton = document.createElement("button");
		doneButton.type = "button";
		doneButton.innerHTML = todo.done ? "o" : "x";
		doneButton.id = "done_" + todo.timestamp;
		field.value = todo.content;
		field.type = "text";
		field.id = todo.timestamp;
		item.appendChild(field);
		item.appendChild(doneButton);
		item.className = todo.done ? "done" : "";
		this.container.appendChild(item);
		return item;
	};
	views.list.prototype.update_stats = function(count){
		this.stats.innerHTML = count + " items left.";
	};
	views.list.prototype["done"] = function(old, v, m){
		var button = document.getElementById("done_" + m.timestamp);
		button.parentNode.className = v ? "done" : "";
		button.parentNode.querySelector("input").disabled = v ? true : false;
		button.innerHTML = v ? "o" : "x";
	};
	views.list.prototype["todos.push"] = function(old, v, m){
		v.subscribe("done", this);
		this.update_stats(m.length());
		this.add(v);
	};
	views.list.prototype["todos.pop"] = function(old, v, m){
		m.unsubscribe("done", this);
		this.update_stats(m.length());
		this.remove(v);
	};
	
	views.settings = function(id, model, controller){
		this.__defineGetter__("value", function(){
			return this.container.checked;
		});
		this.__defineSetter__("value", function(v){
			this.container.checked = v;
		});
		view.apply(this, [id, model, controller]);
		this.checkbox = this.container;
		this.model.subscribe("settings.persist", this);
		this.controller.view = this;
		this.controller.model = this.model;
		this.checkbox.checked = this.model.persist;
		return this;
	};
	
	function todos(list){
		if(!list) list = [];
		for(var i = 0; i < list.length; i++){
			list[i] = new todo(list[i]);
		}
		var self = {
			push: function(todo){
				var found = false;
				for(i in list){
					if(list[i].timestamp === todo.timestamp){
						list[i] = todo;
						found = true;
					}
				}
				if(!found) list.push(todo);
				this.changed("todos.push", null, todo, this);
			}
			, pop: function(todo){
				var i = 0;
				var ubounds = list.length;
				for(i; i<ubounds; i++){
					if(list[i].timestamp === todo.timestamp){
						var removed = list.splice(i, 1);
						this.changed("todos.pop", removed, todo, this);
						return removed;
					}
				}
			}
			, item: function(i){
				return list[i];
			}
			, items: function(){
				return list;
			}
			, length: function(){
				return list.length;
			}
			, find: function(id){
				id = parseInt(id);
				for(i in list){
					if(id === list[i].timestamp) return this.item(i);
				}
				return null;
			}
		};
		model.apply(self, []);
		return self;
	}
	
	var list = new todos();
	var s = storage.settings();
	if(s.persist){
		list = new todos(storage.todos());
	}
	var editing_controller = new controllers.editing();
	var editing = new views.editing("todoapp", {list: list, settings: s}, editing_controller);
	var todos_list = new views.list("todos", {list: list, settings: s}, new controllers.list());
	var settings_view = new views.settings("settings.persist", s, new controllers.settings());
})();
