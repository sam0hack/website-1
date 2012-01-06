<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("photos_resource") || require("photos_resource.php");
class background_image_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(!auth_controller::is_authed()){
			view::set_user_message("Unauthorized");
			resource::redirect("signin");
		}
	}
	public $result;
	function GET(){
		return site::$member->settings()->background_url;
	}
	function POST($background_url){
		site::$member->set_settings("background_url", $background_url);
		notification_center::publish("should_save_member", null, site::$member);
		$view = "background_image/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}