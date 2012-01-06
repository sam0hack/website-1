var controller = function(delegate, model){
	var view = null;
	var options = null;
	this.__defineGetter__("view", function(){
		return view;
	});
	this.__defineSetter__("view", function(v){
		view = v;
	});
	this.__defineSetter__("delegate", function(v){
		delegate = v;
	})
	this.__defineGetter__("delegate", function(){
		return delegate;
	});
	this.__defineGetter__("model", function(){
		return model;
	});
	this.__defineSetter__("model", function(v){
		model = v;
	});
	this.set_editing = function(animated){
		if(this.view.set_editing) this.view.set_editing(animated);
	};
	this.view_did_load = function(view){
		return;
	};
	this.view_did_unload = function(){
		return;
	};
	this.release = function(){
		if(this.view === null) return;
		this.view.release();
		this.view = null;
		this.view_did_unload();
	};
	this.load_view = function(){
		return;
	};
	return this;
};