chin.should_log = true;
chin.require(["model", "controller", "view"], function(){
	function widget(id, controller, model, options){
		var self = view.apply(this, [id, controller, model, options]);
		return this;
	}
	model.settings = function(obj){
		var self = model.apply(this, []);
		var background_url = null;
		var active_tab_id = null;
		var position = {top: 0, left: 0};
		var title = null;
		var colophon = null;
		this.__defineGetter__("title", function(){
			return title;
		});
		this.__defineSetter__("title", function(v){
			var old = title;
			title = v;
			this.changed("title", title, v);
		});
		this.__defineGetter__("colophon", function(){
			return colophon;
		});
		this.__defineSetter__("colophon", function(v){
			var old = colophon;
			colophon = v;
			this.changed("colophon", colophon, v);
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
	view.home = function(id, controller, model, options){
		var self = view.apply(this, [id, controller, model, options]);
		this.title_field = document.querySelector("body>header h1 a");
		this.colophon_field = document.querySelector("body>header p");
		this.model.subscribe("title", this);
		this.model.subscribe("colophon", this);
		return this;
	};
	view.home.prototype = {
		update: function(key, old, v, m){
			if(key === "title") this.title_field.innerHTML = v;
			if(key === "colophon") this.colophon_field.innerHTML = v;
		}
	};
	controller.home = function(delegate, m){
		var self = controller.apply(this, [delegate, m]);
		this.load_view = function(){
			this.view = new view.home(document.body, this, this.model);
		};
		var release = this.release;
		this.release = function(){
			if(this.model !== null) this.model.clear();
			if(this.view){
			}
			release.apply(this, []);
			this.model = null;
		};
		return this;
	};
	controller.home.prototype = {

	};
	widget.tab_bar = function(id, controller, model, options){
		var self = widget.apply(this, [id, controller, model, options]);
		this.close_button = this.container.querySelector("button.close");
		return this;
	};
 	widget.photo_browser = function(id, controller, model, options){
		var self = widget.apply(this, [id, controller, model, options]);
		this.header.style.display = "none";
		this.list = chin.dom(this.container.querySelector("ul"));
		this.model.subscribe("push", this);
		this.model.subscribe("pop", this);
		this.model.subscribe("remove", this);
		return this;
	};
	widget.photo_browser.prototype = {
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
			if(key === "pop") this.remove(v);
			if(key === "remove") this.remove(old);
		}
	};
	widget.settings = function(id, controller, m, options){
		var self = widget.apply(this, [id, controller, m, options]);
		this.header.style.display = "none";		
		return this;
	};
	controller.photo_browser = function(delegate, m){
		var self = controller.apply(this, [delegate, m]);
		this.tab_bar_item = {title:"Display", image: new Image(), tag: 0};
		this.change_delegate = function(e){self.changed(e);};
		this.progress_delegate = function(e){self.progress(e);};
		this.uploaded_delegate = function(e){self.uploaded(e);};
		this.item_clicked_delegate = function(e){self.item_clicked(e);};
		this.submit_delegate = function(e){self.submit(e);};
		this.load_view = function(){
			this.model = new model.list([]);
			this.view = new widget.photo_browser("display", this, this.model);
			if(this.view.title !== null) this.tab_bar_item.title = this.view.title;
			this.view.container.querySelector("input[type='file']").addEventListener("change", this.change_delegate, true);
			this.view.container.querySelector("ul").addEventListener("click", this.item_clicked_delegate, true);
			this.view.container.querySelector("form").addEventListener("submit", this.submit_delegate, true);
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
			if(this.view){
				this.view.container.querySelector("input[type='file']").removeEventListener("change", this.change_delegate, true);				
				this.view.container.querySelector("ul").removeEventListener("click", this.item_clicked_delegate, true);
				this.view.container.querySelector("form").removeEventListener("submit", this.submit_delegate, true);
			}
			release.apply(this, []);
			this.model = null;
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
					chin.log(result);
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
	}
	
	controller.tab_bar = function(delegate, m){
		var self = controller.apply(this, [delegate, m]);
		var item = null;
		this.move_delegate = function(e){self.mouse_move(e);};
		this.up_delegate = function(e){self.mouse_up(e);};
		this.down_delegate = function(e){self.mouse_down(e);};
		this.click_delegate = function(e){self.click(e);};
		this.close_clicked_delegate = function(e){self.close_clicked(e);};
		this.__defineGetter__("item", function(){
			return item;
		});
		this.__defineSetter__("item", function(v){
			item = v;
		});
		this.controllers = {};
		this.load_view = function(){
			var self = this;
			this.view = new widget.tab_bar("info", this, null);
			this.view.container.querySelector("footer.tabs").addEventListener(chin.device.CLICK, this.click_delegate, true);
			this.view.header.addEventListener(chin.device.MOUSEDOWN, this.down_delegate, true);
			this.view.close_button.addEventListener(chin.device.MOUSEDOWN, this.close_clicked_delegate, true);
			this.controllers[this.model.active_tab_id].load_view();
			this.controllers[this.model.active_tab_id].view.hidden = false;
			this.view.title = this.controllers[this.model.active_tab_id].tab_bar_item.title;
			this.view.top = this.model.position.top;
			this.view.left = this.model.position.left;
			this.view.hidden = false;
		};
		var release = this.release;
		this.release = function(){
			this.view.container.querySelector("footer.tabs").removeEventListener(chin.device.CLICK, this.click_delegate, true);
			this.view.header.removeEventListener(chin.device.MOUSEDOWN, this.down_delegate, true);
			this.view.close_button.removeEventListener(chin.device.MOUSEDOWN, this.close_clicked_delegate, true);
			release.apply(this, []);
			this.model = null;
		}
		this.view_did_unload = function(){
			for(key in this.controllers){
				this.controllers[key].release();
				delete this.controllers[key];
			}
			this.controllers = null;
		};
		return this;
	};
	controller.tab_bar.prototype = {
		click: function(e){
			e.preventDefault();
			this.model.active_tab_id = e.target.id;
			for(key in this.controllers){
				if(this.controllers[key]) this.controllers[key].release();
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
		, mouse_down: function(e){
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
			this.view.z = 1000;
			window.addEventListener(chin.device.MOUSEMOVE, this.move_delegate, true);
			window.addEventListener(chin.device.MOUSEUP, this.up_delegate, true);
			return false;
		}
		, drag_move: function(e){
			// stop page from panning on iPhone/iPad - we're moving a note, not the page
			e.preventDefault();
			e = (chin.device.CANTOUCH && e.touches && e.touches.length > 0) ? e.touches[0] : e;
			if(e.clientY - this.view.start_y < 0) return false;
			if(e.clientX - this.view.start_x < 0) return false;
			this.view.left = e.clientX - this.view.start_x;
			this.view.top = e.clientY - this.view.start_y;
			return false;
		}
		, drag_end: function(e){
			window.removeEventListener(chin.device.MOUSEMOVE, this.move_delegate, true);
			window.removeEventListener(chin.device.MOUSEUP, this.up_delegate, true);
			var new_position = {top: this.view.top, left: this.view.left};
			this.model.position = new_position;
			return false;
		}
		, close_clicked: function(e){
			for(key in this.controllers){
				if(this.controllers[key]) this.controllers[key].release();
			}
			this.delegate.view_did_unload();
		}
	};
	controller.settings = function(delegate, m){
		var self = controller.apply(this, [delegate, m]);
		this.tab_bar_item = {title:"Settings", image: new Image(), tag: 1};
		this.keyup_delegate = function(e){self.keyup(e);};
		this.load_view = function(){
			this.view = new widget.settings("settings", this, null);
			if(this.view.title !== null) this.tab_bar_item.title = this.view.title;
			this.view.container.querySelector("textarea").addEventListener("keyup", this.keyup_delegate, true);
			this.view.show();
		};
		var release = this.release;
		this.release = function(){
			if(this.view !== null){
				this.view.container.querySelector("textarea").removeEventListener("keypress", this.keypress_delegate, true);				
			}
			release.apply(this, []);
		};
		return this;
	};
	controller.settings.prototype = {
		keyup: function(e){
			this.model.colophon = e.target.value;
		}
	};
	var app = (function(){
		var edit_link = document.getElementById("edit_link");
		var tab_bar_controller = null;
		var home_controller = null;
		var m = localStorage.joeyguerra;
		var user_message = document.getElementById("user_message");
		var should_save_background = false;
		var should_save_settings = false;
		if(!m){
			m = new model.settings({title: document.querySelector("body>header h1 a").innerHTML, colophon: document.querySelector("body>header p").innerHTML, active_tab_id: "photo_browser_controller", position: {top: 0, left: 0}, background_url: ""});
			localStorage.joeyguerra = JSON.stringify(m);
		}else{
			m = new model.settings(JSON.parse(m));
		}
		home_controller = new controller.home(this, m);
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
				m.background_url = target.src.replace("thumbnails/", "");
			}
			, handleEvent: function(e){
				if(tab_bar_controller !== null){
					this.view_did_unload();
				}else{
					tab_bar_controller = new controller.tab_bar(this, m);
					var photo_browser_controller = new controller.photo_browser(this, null);
					var settings_controller = new controller.settings(this, m);
					tab_bar_controller.controllers.photo_browser_controller = photo_browser_controller;
					tab_bar_controller.controllers.settings_controller = settings_controller;
					for(key in tab_bar_controller.controllers){
						tab_bar_controller.controllers[key].delegate = this;
					}
					tab_bar_controller.delegate = this;
					tab_bar_controller.load_view();
					document.body.addEventListener("click", function(e){self.body_clicked(e);}, true);
					edit_link.innerHTML = "Done";					
				}
			}
			, add_user_message: function(message){
				var aside = chin.dom(tab_bar_controller.view.container.querySelector("aside"));
				aside.elem.innerHTML += message + "<br />";
				aside.show();
			}
			, view_did_unload: function(){
				if(should_save_background) this.save_background(null);
				if(should_save_settings) this.save_settings(null);
				tab_bar_controller.release();
				tab_bar_controller = null;
				edit_link.innerHTML = "Edit";
			}
			, application_did_finish_launching: function(){
				if(!edit_link) return;
				edit_link.addEventListener("click", this, true);
				m.subscribe("background_url", this);
				m.subscribe("active_tab_id", this);
				m.subscribe("position", this);
				m.subscribe("title", this);
				m.subscribe("colophon", this);
			}
			, get_csrf_token: function(){
				var csrf_token_field = document.querySelector("input[name=_csrf_token]");
				return {_csrf_token: csrf_token_field.value};
			}
			, update: function(key, old, v, m){
				if(key === "background_url"){
					should_save_background = true;
					document.body.style["background-image"] = "url(" + v + ")";
				}
				if(["title", "colophon"].indexOf(key) > -1){
					should_save_settings = true;
				}
				localStorage.joeyguerra = JSON.stringify(m);
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
				var data = "background_url=" + m.background_url;
				data += "&_csrf_token=" + document.querySelector("input[name='_csrf_token']").value;
				xhr.open("POST", url);
				xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
				xhr.send(data);
			}			
		};
		self.application_did_finish_launching();
		return self;
	})();
	chin.log(app);
});
