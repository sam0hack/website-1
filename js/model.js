var model = function(){
	var dependents = {};
	this.subscribe = function(key, subscriber){
		if(dependents[key] === undefined) dependents[key] = [];
		dependents[key].push(subscriber);
	};
	this.unsubscribe = function(subscriber){
		for(key in dependents){
			var i = 0;
			var ubounds = dependents[key].length;				
			for(i; i < ubounds; i++){
				if(dependents[key][i] === subscriber){
					dependents[key].splice(i, 1);
					if(dependents[key].length === 0) delete dependents[key];
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
	};
	return this;
};
model.list = function(list){
	model.apply(this, []);
	var inner_list = list ? list : [];
	this.push = function(item){
		inner_list.push(item);
		this.changed("push", null, item);
	};
	this.pop = function(){
		var last = inner_list.pop();
		this.changed("pop", null, last);
		return last;
	};
	this.shift = function(){
		var first = inner_list.shift();
		this.changed("shift", null, first);
		return first;
	};
	this.unshift = function(items){
		var length = inner_list.unshift(items);
		this.changed("unshift", null, items);
		return length;
	};
	this.remove = function(delegate){
		var i = 0;
		var ubounds = inner_list.length;
		var deleted = [];
		for(i; i < ubounds; i++){
			if(delegate(i, inner_list[i])){
				deleted = inner_list.splice(i, 1);
				this.changed("remove", deleted[0], i);
				break;
			}
		}
		return deleted[0];
	};
	this.item = function(i){
		return inner_list[i];
	};
	this.find = function(delegate){
		var i = 0;
		var ubounds = inner_list.length;
		for(i; i < ubounds; i++){
			if(delegate(i, inner_list[i])) return inner_list[i];
		}
		return null;
	};
	this.items = function(){
		return inner_list;
	};
	this.length = function(){
		return inner_list.length;
	};
	this.clear = function(){
		while(this.length() > 0){
			this.pop();
		}
		inner_list = [];
	};
	return this;
};