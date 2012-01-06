<?php
class_exists("post") || require("models/post.php");
class_exists("app_resource") || require("app_resource.php");
class index_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	function GET(){
		$this->output = view::render("index/index", $this);
		$this->title = site::$member->colophon;
		return layout::render("default", $this);
	}
	function POST(){
		$this->output = view::render("index/edit", $this);
		return layout::render("default", $this);
	}
	function PUT($body){
		$post = post::find_by("name=:name", array("name"=>"index"));
		$post = new post(array("body"=>$body, "name"=>"index", "status"=>"public"));
		notification_center::publish("should_save_post", $this, $post);
		if(in_array($this->url->file_type, array("html"))) self::redirect("index");
	}
}
