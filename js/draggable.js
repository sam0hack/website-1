chin.view.draggable = function(id, c, m, options){
	if(id === null){
		var container = document.createElement("div");
		var header = document.createElement("header");
		var close_button = document.createElement("button");
		var title = document.createElement("span");
		title.innerHTML = m.title ? m.title : "";
		close_button.setAttribute("type", "button");
		close_button.innerHTML = "x";
		close_button.className = "close";
		header.appendChild(close_button);
		header.appendChild(title);
		container.appendChild(header);
		id = container;
		container.style.display = "none";
		container.className = "draggable";
		document.body.appendChild(container);
		this.close_button = close_button;
	}
	var self = view.apply(this, [id, c, m, options]);
	this.model.subscribe("position", this);
	return this;
};
chin.view.draggable.prototype.update = function(key, old, v, obj){
	this.left = v.left;
	this.top = v.top;
};
chin.controller.draggable = function(delegate, m){
	if(m === null){
		m = new model();
		model.init({position: {top: 0, left: 0}, title: ""}, m);
	}
	var self = controller.apply(this, [delegate, m]);
	var container_click_delegate = function(e){self.container_click(e);};
	this.move_delegate = function(e){self.mouse_move(e);};
	this.up_delegate = function(e){self.mouse_up(e);};
	this.down_delegate = function(e){self.mouse_down(e);};
	this.click_delegate = function(e){self.click(e);};
	this.close_clicked_delegate = function(e){self.close_clicked(e);};
	this.load_view = function(){
		this.view = new chin.view.draggable(null, this, this.model, null);
		this.view.title = this.model.title;
		this.view.top = this.model.position.top;
		this.view.left = this.model.position.left;
		this.view.add_view(this.delegate.view);
		this.view.header.addEventListener(chin.device.MOUSEDOWN, this.down_delegate, true);
		this.view.close_button.addEventListener(chin.device.MOUSEDOWN, this.close_clicked_delegate, true);
		this.view.container.addEventListener(chin.device.MOUSEDOWN, container_click_delegate, true);
		this.view.show();
		controller.add_view(this.view);
		controller.set_active_view(this.view);
	};
	this.view_did_unload = function(v){
		if(v !== null){
			controller.remove_view(v);
			v.container.removeEventListener("mousedown", container_click_delegate, true);
		}
		v.header.removeEventListener(chin.device.MOUSEDOWN, this.down_delegate, true);
		v.close_button.removeEventListener(chin.device.MOUSEDOWN, this.close_clicked_delegate, true);
		if(this.delegate.view_did_unload) this.delegate.view_did_unload(v);	
	};
	this.container_click = function(e){
		controller.set_active_view(this.view);
	};
	return this;
};
chin.controller.draggable.prototype = {
	mouse_down: function(e){
		this.drag_start(e);
	}
	, mouse_up: function(e){
		this.drag_end(e);
	}
	, mouse_move: function(e){
		this.drag_move(e);
	}
	, drag_start: function(e){
		// stop page from panning on iPhone/iPad - we're moving a note, not the page
		e.preventDefault();
		e = (chin.device.CANTOUCH && e.touches && e.touches.length > 0) ? e.touches[0] : e;
		this.view.start_x = e.clientX - this.view.container.offsetLeft;
		this.view.start_y = e.clientY - this.view.container.offsetTop;
		this.model.position = {top: e.clientY - this.view.start_y, left: e.clientX - this.view.start_x};
		window.addEventListener(chin.device.MOUSEMOVE, this.move_delegate, true);
		window.addEventListener(chin.device.MOUSEUP, this.up_delegate, true);
		return false;
	}
	, calculate_margin_left: function(x,y){
		var w = window.innerWidth;
		var l = 0;
		if(x <= w/2) l = -(w/2-x)/w * 100;
		else l = (x-w/2)/w * 100;
		return l;
	}
	, drag_move: function(e){
		// stop page from panning on iPhone/iPad - we're moving a note, not the page
		e.preventDefault();
		if(this.view === null) return;
		e = (chin.device.CANTOUCH && e.touches && e.touches.length > 0) ? e.touches[0] : e;
		if(e.clientY - this.view.start_y < 0) return false;
		if(e.clientX - this.view.start_x < 0) return false;
		this.model.position = {top: e.clientY - this.view.start_y, left: e.clientX - this.view.start_x};
		return false;
	}
	, drag_end: function(e){
		if(this.view === null) return;
		window.removeEventListener(chin.device.MOUSEMOVE, this.move_delegate, true);
		window.removeEventListener(chin.device.MOUSEUP, this.up_delegate, true);
		this.model.position = {top: this.view.top, left: this.view.left};
		return false;
	}
	, close_clicked: function(e){
		if(e.which === 3) return;
		this.view.hide();
		if(this.delegate.view_did_unload) this.delegate.view_did_unload(this.view);
	}
	, keyup: function(e){
		if(this.delegate.keyup) this.delegate.keyup(e);
	}
	, close: function(){
		this.view.hide();
		if(this.delegate.view_did_unload) this.delegate.view_did_unload(this.view);
	}
};
