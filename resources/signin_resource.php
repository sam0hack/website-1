<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("post") || require("models/post.php");
class signin_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	function GET(){
		$this->output = view::render("member/signin", $this);
		return layout::render("default", $this);
	}
	function POST($signin, $password){
		$signin = strtolower($signin);
		$member = auth_controller::signin($signin, $password);
		if($member !== null){
			if(in_array($this->url->file_type, array("html"))) self::redirect(null);
		}else{
			view::set_user_message("Unauthorized");
		}
		$this->output = view::render("member/signin", $this);
		return layout::render("default", $this);
	}
	function PUT($body){
		$post = post::find_by("name=:name", array("name"=>"index"));
		$post = new post(array("body"=>$body, "name"=>"index", "status"=>"public"));
		notification_center::publish("should_save_post", $this, $post);
		if(in_array($this->url->file_type, array("html"))) self::redirect("index");
	}
}
