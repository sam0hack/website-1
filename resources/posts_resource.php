<?php
class_exists("post") || require("models/post.php");
class_exists("app_resource") || require("app_resource.php");
class posts_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		$this->title = "Manage your posts";
	}
	public $post;
	function GET(){
		$posts = storage::find_posts(null);
		$this->output = view::render("post/index", $this, array("posts"=>$posts));
		return layout::render("default", $this);			
	}
	function POST(post $post){
		$post->owner_id = (int)auth_controller::$current_user->id;
		if(strlen($post->publish_date) === 0) $post->publish_date = null;
		if(!is_numeric($post->publish_date)) $post->publish_date = strtotime($post->publish_date);
		$post->modified = gmmktime();
		$post->created = gmmktime();
		notification_center::publish("should_save_post", $this, $post);
		$this->post = $post;
		if(in_array($this->url->file_type, array("html"))) self::redirect("posts");
		$this->output = view::render("post/show", $this);
		return layout::render("default", $this);
	}
}
