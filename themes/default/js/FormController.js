/* Modified from http://www.profilepicture.co.uk*/
if(!("sixd" in window)){
	sixd = {};
	sixd.controller = function(){
		return this;
	}
}
sixd.controller.form = function(form, options){
	sixd.controller.apply(this, []);
	var self = this;
	this.form = form;
	this.options = options;
	this.progress_bar = document.getElementById("progress");
	this.user_message = document.getElementById("user_message");
	this.status = document.getElementById("status");
	this.file_upload = document.querySelector("input[type='file']");
	this.file_upload.addEventListener("change", update_file_list, false);
	try {
        if (this.form && this.form.action) {
            this.form.addEventListener("submit", submit, false);
        } else throw "noForm";
    } catch (ex) {
        if (ex == "noForm")
            console.log("Form is null or has no action");
        else alert(ex.message);
    }
	function submit(e){
        e.preventDefault();
        e.stopPropagation();
        self.send(e);
        return false;
	}
	function update_file_list(e){
		var files = self.file_upload.files;
		if (files) {
			var file_list = document.getElementById("file_list");
			while(file_list.childNodes.length) {
				file_list.removeChild(file_list.firstChild);
			}
			for (var i = 0; i < files.length; i++) {
				var li = document.createElement("li");
				li.textContent = files[i].name + " ( " + Math.round(files[i].size / 1024) + "KB )";
				file_list.appendChild(li);
			}
		}
		self.send(e);
	}
	return this;
}
sixd.controller.form.prototype = {
	loaded: function(e){
		this.update_progress(100);
	}
	, send: function(e){
		var self = this;
		var fd = new FormData(),
            xhr = new XMLHttpRequest(),
            upload = xhr.upload,
            method = "POST"
            fields = this.form.getElementsByTagName("input");
        for (var i = 0; i < fields.length; i++) {
            if (fields[i].type != "submit") {
                if (fields[i].type == "file") {
                    for (var j = 0; j < fields[i].files.length; j++) {
                        fd.append("files[]", fields[i].files[j]);
                    }
                } else fd.append(fields[i].name, fields[i].value);
            }
        }
        this.status.textContent = "(uploading...)";
        upload.addEventListener("progress", function(e){self.show_progress(e);}, false);
        upload.addEventListener("load", function(e){self.loaded(e);}, false);
        upload.addEventListener("error", function (ev) {console.log(ev)}, false);
        if (this.form.method && this.form.method.length)
            method = this.form.method;
        xhr.open(method, this.form.action + ".json");
        xhr.send(fd);
        xhr.addEventListener("readystatechange", function(e){self.show_response(e);}, false);
	}
	, show_progress: function(e){
        if (e.lengthComputable) {
           this.update_progress(Math.round((e.loaded / e.total) * 100));
        }
	}
	, show_response: function(e){
        switch (e.target.readyState) {
            case 3:
                this.status.textContent = "(receiving response)"
                break;
            case 4:
                this.status.textContent = "(finished!)"
				var photos = JSON.parse(e.target.responseText);
				chin.notification_center.publish("files_were_uploaded", this, photos);
				var errors = [];
				for(var i = 0; i < photos.length; i++){
					if(photos[i].error !== null){
						errors.push(photos[i].error);
					}
				}
                this.user_message.innerHTML = errors.length > 0 ? errors.join(",") : this.options.successful_message;
				$(this.user_message).fadeIn({duration: "fast"});
				this.update_progress(0);
				break;
        }
	}
	, update_progress: function(pct){
        this.progress_bar.value = pct;
		this.progress_bar.style.width = this.progress_bar.value + "%";
	}
};
