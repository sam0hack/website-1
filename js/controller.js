var controller = function(delegate, model){
	var view = null;
	var options = null;
	var self = this;
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
	};
	this.load_view = function(){
		return;
	};
	var eventMatchers = {
	    "HTMLEvents": /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
	    "MouseEvents": /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/
	};
	var defaultOptions = {
	    pointerX: 0,
	    pointerY: 0,
	    button: 0,
	    ctrlKey: false,
	    altKey: false,
	    shiftKey: false,
	    metaKey: false,
	    bubbles: true,
	    cancelable: true
	};
	function extend(destination, source) {
        for (var property in source)
          destination[property] = source[property];
        return destination;
    }
    
	this.fire = function(element, eventName){
        var options = extend(defaultOptions, arguments[2] || {});
        var oEvent, eventType = null;
        for (var name in eventMatchers){
            if (eventMatchers[name].test(eventName)) { eventType = name; break; }
        }
        if (!eventType)
            throw new SyntaxError('Only HTMLEvents and MouseEvents interfaces are supported');
        if (document.createEvent){
            oEvent = document.createEvent(eventType);
            if (eventType == 'HTMLEvents'){
                oEvent.initEvent(eventName, options.bubbles, options.cancelable);
            }else{
				oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
					options.button, options.pointerX, options.pointerY, options.pointerX, options.pointerY,
					options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
            }
            element.dispatchEvent(oEvent);
        }else{
            options.clientX = options.pointerX;
            options.clientY = options.pointerY;
            var evt = document.createEventObject();
            oEvent = extend(evt, options);
            element.fireEvent('on' + eventName, oEvent);
        }
        return element;
    };

	return this;
};

(function(obj){
	var views = [];
	obj.set_active_view = function(v){
		var i = 0;
		var ubounds = views.length;
		for(i = 0; i < ubounds; i++){
			views[i].container.style["z-index"] = 1;
		}
		v.container.style["z-index"] = 2;
	};
	obj.add_view = function(v){
		views.push(v);
	};
	obj.remove_view = function(v){
		var i = 0;
		var ubounds = views.length;
		for(i = 0; i < ubounds; i++){
			if(views[i] === v){
				return views.splice(i, 1);
			}
		}
	};
})(controller);