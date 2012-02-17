chin.should_log = true;
model.settings = function(obj){
	var self = model.apply(this, []);
	var background_url = null;
	var logo_url = null;
	var active_tab_id = null;
	var position = {top: 0, left: 0};
	var site_title = null;
	var colophon = null;
	this.__defineGetter__("site_title", function(){
		return site_title;
	});
	this.__defineSetter__("site_title", function(v){
		var old = site_title;
		site_title = v;
		this.changed("site_title", site_title, v);
	});
	this.__defineGetter__("colophon", function(){
		return colophon;
	});
	this.__defineSetter__("colophon", function(v){
		var old = colophon;
		colophon = v;
		this.changed("colophon", colophon, v);
	});
	this.__defineGetter__("logo_url", function(){
		return logo_url;
	});
	this.__defineSetter__("logo_url", function(v){
		var old = logo_url;
		logo_url = v;
		this.changed("logo_url", logo_url, v);
	});
	this.__defineGetter__("background_url", function(){
		return background_url;
	});
	this.__defineSetter__("background_url", function(v){
		var old = background_url;
		background_url = v;
		this.changed("background_url", old, v);
	});
	this.__defineGetter__("active_tab_id", function(){
		return active_tab_id;
	});
	this.__defineSetter__("active_tab_id", function(v){
		var old = active_tab_id;
		active_tab_id = v;
		this.changed("active_tab_id", old, v);
	});
	this.__defineGetter__("position", function(){
		return position;
	});
	this.__defineSetter__("position", function(v){
		var old = position;
		position = v;
		this.changed("position", old, v);
	});
	if(obj !== null){
		for(key in obj){
			this[key] = obj[key];
		}
	}
};

model.post = function(obj){
	var self = model.apply(this, []);
	var body = null;
	var position = null;
	var posts = new model.list();
	this.__defineGetter__("posts", function(){
		return posts;
	});
	this.__defineSetter__("posts", function(v){
		var old = posts;
		posts = v;
		this.changed("posts", posts, v);
	});
	this.__defineGetter__("position", function(){
		return position;
	});
	this.__defineSetter__("position", function(v){
		var old = position;
		position = v;
		this.changed("position", position, v);
	});
	this.__defineGetter__("body", function(){
		return body;
	});
	this.__defineSetter__("body", function(v){
		var old = body;
		body = v;
		this.changed("body", body, v);
	});
	if(obj !== null){
		for(key in obj){
			this[key] = obj[key];
		}
	}
};
model.view = function(obj){
	var self = model.apply(this, []);
	var position = {top: 0, left: 0};
	var z = 1000;
	var title = null;
	this.__defineGetter__("title", function(){
		return title;
	});
	this.__defineSetter__("title", function(v){
		var old = title;
		title = v;
		this.changed("title", old, v);
	});
	this.__defineGetter__("position", function(){
		return position;
	});
	this.__defineSetter__("position", function(v){
		var old = position;
		position = v;
		this.changed("position", old, v);
	});
	this.__defineGetter__("z", function(){
		return z;
	});
	this.__defineSetter__("z", function(v){
		var old = z;
		z = v;
		this.changed("z", old, v);
	});
	if(obj !== null) model.init(obj, this);
	
	return this;
};
view.tweet_list = function(id, controller, model, options){
	var self = view.apply(this, [id, controller, model, options]);
	this.model.posts.subscribe("push", this);
	this.model.posts.subscribe("pop", this);
/*	var set_editing = this.set_editing;
	this.set_editing = function(target, flag, animated){
		set_editing.apply(this, [flag, animated]);
		if(!this.is_editing) return;
		var elem = target.parentNode;
		while(elem.nodeName !== "ARTICLE"){
			elem = elem.parentNode;
		}
		var header = elem.querySelector("header");
	};*/
	return this;
};
view.tweet_list.prototype = {
	update: function(key, old, v, m){
		chin.log([key, old, v, m]);
		this.add(v);
	}
	, article: function(item){
		var elem = document.createElement("article");
		var p = document.createElement("p");
		var footer = document.createElement("footer");
		var time = document.createElement("time");
		p.innerHTML = item.body;
		time.innerHTML = item.publish_date;
		time.setAttribute("pubdate", true);
		time.setAttribute("datetime", item.publish_date);
		footer.appendChild(time);
		elem.appendChild(p);
		elem.appendChild(footer);
		return elem;
	}
	, add: function(tweet){
		var first_article = this.container.querySelector("article");
		this.container.insertBefore(this.article(tweet), first_article);
	}
	, remove: function(tweet){
		
	}
};
view.home = function(id, controller, model, options){
	var self = view.apply(this, [id, controller, model, options]);
	this.title_field = document.querySelector("body>header h1 a");
	this.colophon_field = document.querySelector("body>header p");
	this.model.subscribe("site_title", this);
	this.model.subscribe("colophon", this);
	return this;
};
view.home.prototype = {
	update: function(key, old, v, m){
		if(key === "site_title") this.title_field.innerHTML = v;
		if(key === "colophon") this.colophon_field.innerHTML = v;
	}
};
view.post = function(id, controller, model, options){
	var self = view.apply(this, [id, controller, model, options]);
	this.close_button = this.container.querySelector("button.close");
	this.model.subscribe("body", this);
	this.model.subscribe("type", this);
	return this;
};
view.post.prototype = {
	update: function(key, old, v, m){
		chin.log([key, old, v]);
	}
};

controller.post = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	this.post = {body: "", publish_date: new Date()};
	this.controller = null;
	this.keyup_delegate = function(e){self.keyup(e);};
	this.submit_delegate = function(e){self.submit(e);};
	this.load_view = function(){
		var self = this;
		this.view = new view.post(document.getElementById("post"), this, this.model);
		this.view.container.querySelector("textarea").addEventListener(chin.device.KEYUP, this.keyup_delegate, true);
		this.view.container.querySelector("form").addEventListener(chin.device.SUBMIT, this.submit_delegate, true);
		this.model.title = "Write a post";
		this.controller = new chin.controller.draggable(this, this.model);
		this.controller.load_view();
		this.view.hidden = false;
	};
	var release = this.release;
	this.release = function(){
		if(this.model !== null) this.model.clear();
		release.apply(this, []);
		this.model = null;
	};
	this.view_did_unload = function(v){
		v.container.querySelector("textarea").removeEventListener(chin.device.KEYUP, this.keyup_delegate, true);
		v.container.querySelector("form").removeEventListener(chin.device.SUBMIT, this.submit_delegate, true);
	};
	return this;
};
controller.post.prototype = {
	keyup: function(e){
		this.post.body = e.target.value;
		this.post.publish_date = new Date();
	}
	, submit: function(e){
		e.preventDefault();
		var posts = this.model.posts;
		posts.push(this.post);
		this.model.posts = posts;
		this.post = {body: "", publish_date: new Date()};
		this.delegate.save_post(this.post.body);
		this.controller.close();
		posts = null;
	}
};
controller.tweet_list = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	this.controller = null;
	var view_model = localStorage.tweet_list_view;
	if(view_model){
		view_model = JSON.parse(view_model);
	}else{
		view_model = {position: {top: 0, left: 0}, title:"Tweet List", z: 1000};
	}
	this.view_model = new model.view(view_model);
	this.view_model.subscribe("position", this);
	var edit_button_clicked_delegate = function(e){self.edit_button_clicked(e);};
	this.load_view = function(){
		this.view = new view.tweet_list(document.getElementById("post_list"), this, this.model);
		this.view.container.addEventListener("click", edit_button_clicked_delegate, true);
		this.view.show();
	};
	var release = this.release;
	this.release = function(){
		if(this.model !== null) this.model.clear();
		release.apply(this, []);
		this.model = null;
	};
	return this;
};
controller.tweet_list.prototype.edit_button_clicked = function(e){
	if(e.target.className !== "edit") return;
	e.preventDefault();
	this.view.set_editing(e.target, e.target.innerHTML === "Edit", true);
	e.target.innerHTML = e.target.innerHTML === "Edit" ? "Done" : "Edit";
};
controller.tweet_list.prototype.update = function(key, old, v, obj){
	localStorage.tweet_list_view = JSON.stringify(obj);
};
controller.home = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	this.load_view = function(){
		this.view = new view.home(document.body, this, this.model);
	};
	var release = this.release;
	this.release = function(){
		if(this.model !== null) this.model.clear();
		release.apply(this, []);
		this.model = null;
	};
	return this;
};
controller.home.prototype = {

};
view.tab_bar = function(id, controller, model, options){
	var self = view.apply(this, [id, controller, model, options]);
	return this;
};
view.photo_browser = function(id, controller, model, options){
	var self = view.apply(this, [id, controller, model, options]);
	this.header.style.display = "none";
	this.list = chin.dom(this.container.querySelector("ul"));
	this.model.subscribe("push", this);
	this.model.subscribe("pop", this);
	this.model.subscribe("remove", this);
	return this;
};
view.photo_browser.prototype = {
	add: function(item){
		if(typeof(item) === "string") this.list.append(chin.dom("li").html(item));
		else this.list.append(chin.dom("li").append(chin.dom("button").html("x").set({class: "close"}).elem).append(chin.dom("a").set({href:"", title:item.title}).append(chin.dom("img").set({src: item.src, alt:item.title}).elem).elem).elem);
	}
	, remove: function(item){
		var elem = this.container.querySelector("li a img[src='" + item.src + "']");
		this.list.remove(elem.parentNode.parentNode);
	}
	, update: function(key, old, v, m){
		if(key === "push") this.add(v);
		if(key === "pop") this.remove(old);
		if(key === "remove") this.remove(old);
	}
};
view.settings = function(id, controller, m, options){
	var self = view.apply(this, [id, controller, m, options]);
	this.header.style.display = "none";		
	return this;
};
controller.photo_browser = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	this.tab_bar_item = {title:"Background", image: new Image(), tag: 0};
	this.change_delegate = function(e){self.changed(e);};
	this.progress_delegate = function(e){self.progress(e);};
	this.uploaded_delegate = function(e){self.uploaded(e);};
	this.item_clicked_delegate = function(e){self.item_clicked(e);};
	this.submit_delegate = function(e){self.submit(e);};
	this.load_view = function(){
		this.model = new model.list([]);
		this.view = new view.photo_browser("display", this, this.model);
		this.tab_bar_item.title = this.view.title;
		this.view.container.querySelector("input[type='file']").addEventListener("change", this.change_delegate, true);
		this.view.container.querySelector("ul").addEventListener("click", this.item_clicked_delegate, true);
		this.view.container.querySelector("form").addEventListener(chin.device.SUBMIT, this.submit_delegate, true);
		var xhr = new XMLHttpRequest();
		var self = this;
		xhr.addEventListener("readystatechange", function(e){
			if(e.target.readyState !== XMLHttpRequest.DONE) return;
			if(e.target.status === 200){
				var result = JSON.parse(e.target.responseText);
				var i = 0;
				for(i=0;i<result.length;i++){
					self.model.push(result[i]);
				}
				self.view.show();
			}
		}, true);
		var url = chin.root_url() + "/thumbnails.json";
		xhr.open("GET", url);
		xhr.send();
	};
	var release = this.release;
	this.release = function(){
		if(this.model !== null) this.model.clear();
		release.apply(this, []);
		this.model = null;
	};
	this.view_did_unload = function(v){
		v.container.querySelector("input[type='file']").removeEventListener("change", this.change_delegate, true);				
		v.container.querySelector("ul").removeEventListener("click", this.item_clicked_delegate, true);
		v.container.querySelector("form").removeEventListener(chin.device.SUBMIT, this.submit_delegate, true);
		this.delegate.view_did_unload(v);
	};
	return this;
};
controller.photo_browser.prototype = {
	item_clicked: function(e){
		e.preventDefault();
		var img = e.target.parentNode.querySelector("img");
		if(e.target.nodeName === "BUTTON"){
			this.delete(img);
		}else if(e.target.nodeName === "IMG"){
			this.delegate.image_was_clicked(img);
		}
	}
	, submit: function(e){
		e.preventDefault();
		this.delegate.save_background(e);
	}
	, update: function(key, old, v, m){
		chin.log([key, v]);
	}
	, delete: function(img){
		var src = img.src.replace(chin.root_url() + "photos\/", "");
		src = src.replace("thumbnails/", "");
		var self = this;
		var url = chin.root_url() + "photos.json";
		var xhr = new XMLHttpRequest();
		var self = this;
		xhr.addEventListener("readystatechange", function(e){
			if(e.target.readyState !== XMLHttpRequest.DONE) return;
			if(e.target.status === 200){
				var result = JSON.parse(e.target.responseText);
				var headers = chin.parse_headers(e.target);
				user_message.innerHTML = "";
				if(headers.Warning){
					user_message.innerHTML = headers.Warning;
				}
				if(!result.error) user_message.innerHTML += "<br />Photo was deleted.";
				user_message.style.display = "block";
				setTimeout(function(){
					//user_message.style.display = "none";
				}, 2000);
				var name = result[0].thumbnail_src.split("/");
				name = name[name.length-1];
				self.model.remove(function(i, img){
					var n = img.src.split("/");
					n = n[n.length-1];
					return name === n;
				});
				self.delegate.photo_was_deleted(result);
			}
		}, true);
		var token = this.view.container.querySelector("input[name=_csrf_token]").value;
		var data = {paths: [src], _csrf_token: token};
		xhr.open("DELETE", url);
		xhr.setRequestHeader("Content-Type", "application/json");
		xhr.send(JSON.stringify(data));
	}
	, changed: function(e){
		var self = this;
		var data = new FormData();
		var xhr = new XMLHttpRequest();
		var form = e.target.parentNode;
		var fields = form.querySelectorAll("input,select,textarea");
		var max = form.querySelector("input[name='MAX_FILE_SIZE']").value/1000;
		var actual = 0;
		var failed_images = [];
		var files_to_send = [];
		for(i=0;i<e.target.files.length; i++){
			actual = e.target.files[i].size/1000;
			if(actual > max){
				failed_images.push(e.target.files[i]);
			}else{
				files_to_send.push(e.target.files[i]);
			}
		}
		if(failed_images.length > 0){
			for(i=0;i<failed_images.length;i++){
				this.delegate.add_user_message(failed_images[i].name + " is too big.");
			}
		}
		if(files_to_send.length === 0){
			e.target.parentNode.innerHTML = e.target.parentNode.innerHTML;
			return;
		}
		for(i=0;i<fields.length;i++){
			if(fields[i].type !== "file"){
				data.append(fields[i].name, fields[i].value);					
			}
		}
		for(key=0;key<files_to_send.length;key++){
			data.append("files[]", files_to_send[key]);
		}
		xhr.addEventListener("readystatechange", function(e){
			if(e.target.readyState !== XMLHttpRequest.DONE) return;
			if(e.target.status === 200){
				var result = JSON.parse(e.target.responseText);
				for(i=0;i<result.length;i++){
					if(result[i].error !== null){
						self.delegate.add_user_message(result[i].error);
					}else{
						self.model.push({src: result[i].thumbnail_src, title: result[i].name});
					}
					
				}
			}
			e.target.removeEventListener("readystatechange", this, true);
		}, true);
		xhr.upload.addEventListener("progress", this.progress_delegate, true);
		xhr.upload.addEventListener("load", this.uploaded_delegate, true);
		xhr.open(form.method, e.target.parentNode.action + ".json");
		xhr.send(data);
	}
	, uploaded: function(e){
		try{
			e.target.removeEventListener("progress", this.progress_delegate, true);
			e.target.removeEventListener("load", this.uploaded_delegate, true);
			var field = this.view.container.querySelector("input[type='file']");
			field.removeEventListener("change", this.change_delegate, true);
			var new_field = chin.dom("input").set({type: "file", name: "files", multiple: true});
			new_field.elem.addEventListener("change", this.change_delegate, true);
			field.parentNode.replaceChild(new_field.elem, field);
		}catch(e){
			chin.log("Exception occurred:");
			chin.log(e);
		}
	}
	, progress: function(e){
	}
	, should_close: function(){
		if(!this.view) return;
		this.view.hide();
	}
}

controller.tab_bar = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	var item = null;
	this.view_controller = null;
	this.click_delegate = function(e){self.click(e);};
	this.__defineGetter__("item", function(){
		return item;
	});
	this.__defineSetter__("item", function(v){
		item = v;
	});
	this.controllers = {};
	this.load_view = function(){
		var self = this;
		this.view = new view.tab_bar("info", this, null);
		this.view.container.querySelector("footer.tabs").addEventListener(chin.device.CLICK, this.click_delegate, true);
		this.view.title = this.controllers[this.model.active_tab_id].tab_bar_item.title;
		this.controllers[this.model.active_tab_id].load_view();
		this.controllers[this.model.active_tab_id].view.show();
		this.view_controller = new chin.controller.draggable(this, this.model);
		this.view_controller.load_view();
		this.view.hidden = false;
	};
	var release = this.release;
	this.release = function(){
		release.apply(this, []);
		this.model = null;
	};
	this.view_did_unload = function(v){
		this.view.container.querySelector("footer.tabs").removeEventListener(chin.device.CLICK, this.click_delegate, true);
		this.delegate.view_did_unload(this.view);
	};
	return this;
};
controller.tab_bar.prototype = {
	click: function(e){
		e.preventDefault();
		this.model.active_tab_id = e.target.id;
		for(key in this.controllers){
			if(this.controllers[key]) this.controllers[key].should_close();
		}
		if(this.controllers[this.model.active_tab_id]){
			this.view.title = this.controllers[this.model.active_tab_id].tab_bar_item.title;
			this.controllers[this.model.active_tab_id].load_view();				
		}
	}
	, save_background: function(e){
		this.delegate.save_background(e);
	}
	, photo_was_deleted: function(result){
		this.delegate.photo_was_deleted(result);
	}
	, should_close: function(){
		this.view_controller.close();
	}
};
controller.settings = function(delegate, m){
	var self = controller.apply(this, [delegate, m]);
	this.tab_bar_item = {title:"Settings", image: new Image(), tag: 1};
	this.keyup_delegate = function(e){self.keyup(e);};
	this.load_view = function(){
		this.view = new view.settings("settings", this, null);
		if(this.view.title !== null) this.tab_bar_item.title = this.view.title;
		this.view.container.querySelector("textarea").addEventListener(chin.device.KEYUP, this.keyup_delegate, true);
		this.view.container.querySelector("input").addEventListener(chin.device.KEYUP, this.keyup_delegate, true);
		this.view.show();
	};
	var release = this.release;
	this.release = function(){
		this.tab_bar_item =  null;
		release.apply(this, []);
	};
	this.view_did_unload = function(v){
		v.container.querySelector("textarea").removeEventListener(chin.device.KEYUP, this.keyup_delegate, true);				
		v.container.querySelector("input").removeEventListener(chin.device.KEYUP, this.keyup_delegate, true);
		this.delegate.view_did_unload(v);
	};
	return this;
};
controller.settings.prototype = {
	keyup: function(e){
		if(e.target.name === "member[colophon]") this.model.colophon = e.target.value;
		if(e.target.name === "site_title") this.model.site_title = e.target.value;
	}
	, should_close: function(){
		if(!this.view) return;
		this.view.hide();
	}
};
(function(){
	var app = (function(){
		var edit_link = document.getElementById("edit_link");
		var post_link = document.getElementById("post_link");
		var tab_bar_controller = null;
		var post_controller = null;
		var home_controller = null;
		var settings = localStorage.settings;
		var post = localStorage.post;
		var user_message = document.getElementById("user_message");
		var should_save_background = false;
		var should_save_settings = false;
		var tweets = document.querySelectorAll("body>section>aside article");
		var posts = new model.list();
		for(var i =0; i < tweets.length; i++){
			var obj = {body: tweets[i].querySelector("div").innerHTML, publish_date: tweets[i].querySelector("time").innerHTML};
			posts.push(obj);
		}
		if(!settings){
			settings = new model.settings({site_title: document.querySelector("body>header h1 a").innerHTML, colophon: document.querySelector("body>header p").innerHTML, active_tab_id: "photo_browser_controller", position: {top: 0, left: 0}, background_url: document.body.style["background-image"].replace(/url\(/, "").replace(/\)$/, ""), logo_url: ""});
			localStorage.settings = JSON.stringify(settings);
		}else{
			settings = new model.settings(JSON.parse(settings));
		}
		if(!post){
			post = new model.post({body: "", position: {top: 0, left: 0}});
			localStorage.post = JSON.stringify(post);
		}else{
			post = new model.post(JSON.parse(post));
		}
		post.posts = posts;
		home_controller = new controller.home(this, settings);
		home_controller.load_view();
		var self = {
			add_subview: function(view){
			}
			, body_clicked: function(e){
				user_message.style.display = "none";
				if(tab_bar_controller === null) return;
				var aside = chin.dom(tab_bar_controller.view.container.querySelector("aside"));
				aside.hide();
			}
			, image_was_clicked: function(target){
				settings.background_url = target.src.replace("thumbnails/", "");
			}
			, edit_link_clicked: function(e){
				if(tab_bar_controller !== null){
					tab_bar_controller.should_close();
					edit_link.innerHTML = "Edit";
				}else{
					tab_bar_controller = new controller.tab_bar(this, settings);
					photo_browser_controller = new controller.photo_browser(this, null);
					settings_controller = new controller.settings(this, settings);
					tab_bar_controller.controllers.photo_browser_controller = photo_browser_controller;
					tab_bar_controller.controllers.settings_controller = settings_controller;
					for(key in tab_bar_controller.controllers){
						tab_bar_controller.controllers[key].delegate = this;
					}
					tab_bar_controller.delegate = this;
					tab_bar_controller.load_view();
					edit_link.innerHTML = "Done";
				}
			}
			, post_link_clicked: function(e){
				post_controller = new controller.post(this, post);
				post_controller.load_view();
			}
			, add_user_message: function(message){
				var aside = chin.dom(tab_bar_controller.view.container.querySelector("aside"));
				aside.elem.innerHTML += message + "<br />";
				aside.show();
			}
			, view_did_unload: function(v){
				if(v instanceof view.post){
					chin.log("post was closed");
				}else if(tab_bar_controller !== null){
					if(should_save_background) this.save_background(null);
					if(should_save_settings) this.save_settings(null);
					photo_browser_controller.release();
					settings_controller.release();
					tab_bar_controller.release();
					photo_browser_controller = null;
					settings_controller = null;
					tab_bar_controller = null;
					edit_link.innerHTML = "Edit";			
				}
			}
			, application_did_finish_launching: function(){
				if(!edit_link) return;
				edit_link.addEventListener("click", edit_click_delegate, true);
				post_link.addEventListener("click", post_click_delegate, true);
				settings.subscribe("background_url", this);
				settings.subscribe("active_tab_id", this);
				settings.subscribe("position", this);
				settings.subscribe("site_title", this);
				settings.subscribe("colophon", this);

				post.subscribe("position", this);
				document.body.addEventListener("click", function(e){self.body_clicked(e);}, true);
			}
			, get_csrf_token: function(){
				var csrf_token_field = document.querySelector("input[name=_csrf_token]");
				return {_csrf_token: csrf_token_field.value};
			}
			, update: function(key, old, value, obj){
				if(obj instanceof model.post){
					localStorage.post = JSON.stringify(obj);
				}else if(obj instanceof model.settings){
					if(key === "background_url"){
						should_save_background = true;
						document.body.style["background-image"] = "url(" + value + ")";
					}
					if(["site_title", "colophon"].indexOf(key) > -1){
						should_save_settings = true;
					}
					localStorage.settings = JSON.stringify(obj);
				}
			}
			, photo_was_deleted: function(result){
				var name = document.body.style["background-image"].split("/");
				name = name[name.length-1];
				var deleted_name = result[0].thumbnail_src.replace("thumbnails/", "").split("/");
				deleted_name = deleted_name[deleted_name.length-1];
				if(name === deleted_name){
					document.body.style["background-image"] = null;
				}
			}
			, save_post: function(e){
				var url = chin.root_url() + "posts.json";
				var xhr = new XMLHttpRequest();
				var self = this;
				xhr.addEventListener("readystatechange", function(e){
					if(e.target.readyState !== XMLHttpRequest.DONE) return;
					var headers = chin.parse_headers(e.target);
					if(e.target.status === 200){
						if(e.target.responseText.length > 0){
							var result = JSON.parse(e.target.responseText);
							user_message.innerHTML = "";
							if(!result.error) user_message.innerHTML += "<br />You're message has been saved.";
						}
					}
					if(headers.Warning){
						user_message.innerHTML += headers.Warning;
					}
					user_message.style.display = "block";
					setTimeout(function(){
						//user_message.style.display = "none";
					}, 2000);
				}, true);
				var fields = post_controller.view.container.querySelectorAll("input, textarea");
				var data = [];
				var ubounds = fields.length;
				for(i=0;i<ubounds;i++){
					if(fields[i].value.length > 0){
						if(fields[i].type === "checkbox"){
							if(fields[i].checked) data.push(fields[i].name + "=" + fields[i].value);
						}else data.push(fields[i].name + "=" + encodeURIComponent(fields[i].value));
					}
				}

				xhr.open("POST", url);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(data.join("&"));
			}
			, save_settings: function(e){
				should_save_settings = false;
				var url = chin.root_url() + "settings.json";
				var xhr = new XMLHttpRequest();
				var self = this;
				xhr.addEventListener("readystatechange", function(e){
					if(e.target.readyState !== XMLHttpRequest.DONE) return;
					if(e.target.status === 200){
						var result = JSON.parse(e.target.responseText);
						var headers = chin.parse_headers(e.target);
						user_message.innerHTML = "";
						if(headers.Warning){
							user_message.innerHTML = headers.Warning;
						}
						if(!result.error) user_message.innerHTML += "<br />You're settings have been updated.";
						user_message.style.display = "block";
						setTimeout(function(){
							//user_message.style.display = "none";
						}, 2000);
					}
				}, true);
				var fields = tab_bar_controller.controllers.settings_controller.view.container.querySelectorAll("input, textarea");
				var data = {};
				var ubounds = fields.length;
				for(i=0;i<ubounds;i++){
					if(fields[i].value.length > 0){
						if(fields[i].type === "checkbox") data[fields[i].name] = fields[i].checked;
						else data[fields[i].name] = fields[i].value;
					}
				}
				xhr.open("PUT", url);
				xhr.setRequestHeader("Content-Type", "application/json");
				xhr.send(JSON.stringify(data));		
			}
			, save_background: function(e){
				should_save_background = false;
				var url = chin.root_url() + "background_image.json";
				var xhr = new XMLHttpRequest();
				var self = this;
				xhr.addEventListener("readystatechange", function(e){
					if(e.target.readyState !== XMLHttpRequest.DONE) return;
					if(e.target.status === 200){
						var result = JSON.parse(e.target.responseText);
						var headers = chin.parse_headers(e.target);
						user_message.innerHTML = "";
						if(headers.Warning){
							user_message.innerHTML = headers.Warning;
						}
						if(!result.error) user_message.innerHTML += "<br />You're background image has been set.";
						user_message.style.display = "block";
						setTimeout(function(){
							//user_message.style.display = "none";
						}, 2000);
					}
				}, true);
				var data = "background_url=" + settings.background_url;
				data += "&_csrf_token=" + document.querySelector("input[name='_csrf_token']").value;
				xhr.open("POST", url);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(data);
			}			
		};
		var settings_controller = null;
		var photo_browser_controller = null;
		var edit_click_delegate = function(e){self.edit_link_clicked();};
		var post_click_delegate = function(e){self.post_link_clicked(e);};
		self.application_did_finish_launching();
		return self;
	})();
	chin.log(app);
})();