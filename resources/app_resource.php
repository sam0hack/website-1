<?php
class_exists("post") || require("models/post.php");
class app_resource extends resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(auth_controller::is_authed() && $this->resource_name === "index"){
			$this->js .= $this->get_script_markup("draggable");
			$this->js .= $this->get_script_markup("imafreakinmember");
		}
	}
	function __destruct(){}
	static function url_for_member($key, $params = null){
		if(site::$member->is_owner) return resource::url_for($key, $params);
		return resource::url_for(site::$member->signin . "/$key");
	}
	static function url_for_user($key, $params = null){
		if(auth_controller::$current_user->is_owner) return resource::url_for($key, $params);
		return resource::url_for(auth_controller::$current_user->signin . "/$key");
	}
}