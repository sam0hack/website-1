<?php
class_exists("post") || require("models/post.php");
class_exists("app_resource") || require("app_resource.php");
class post_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		$this->title = "Do stuff with a post, like read and write.";
	}
	public $post;
	function GET(post $post){
		$view = "post/index";
		$this->post = storage::find_posts_one(array("where"=>"owner_id=:owner_id and ROWID=:id", "args"=>array("owner_id"=>(int)site::$member->id, "id"=>(int)$post->id)));
		if($this->post === null){
			$this->status = new http_status(array("code"=>404, "message"=>"Not Found"));
			return;
		}
		$this->output = view::render($view, $this);
		return layout::render("default", $this);		
	}
	function POST(post $post){
		if(!auth_controller::is_authed()){
			view::set_user_message("Unauthed");
			return self::redirect("signin");
		}
		$this->post = storage::find_posts_one(array("where"=>"ROWID=:id", "args"=>array("id"=>(int)$post->id, "owner_id"=>(int)auth_controller::$current_user->id)));
		$view = "post/edit";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	function PUT(post $post){
		$post->owner_id = (int)auth_controller::$current_user->id;
		if(strlen($post->publish_date) === 0) $post->publish_date = null;
		$post->url = strlen($post->url) === 0 ?  post::make_url($post) : post::sanitize_url($post);
		if(!is_numeric($post->publish_date)) $post->publish_date = strtotime($post->publish_date);
		$post->modified = gmmktime();
		$post->created = gmmktime();
		notification_center::publish("should_save_post", $this, $post);
		$this->post = $post;
		if(in_array($this->url->file_type, array("html"))) self::redirect($this->post->url);
		$this->output = view::render("post/show", $this);
		return layout::render("default", $this);
	}
}
