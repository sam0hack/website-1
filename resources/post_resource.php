<?php
class_exists("post") || require("models/post.php");
class_exists("meta") || require("models/meta.php");
class_exists("setting") || require("models/setting.php");
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
	function PUT(post $post, $meta = array(), $tags = null){
		$this->post = storage::find_posts_one(array("where"=>"owner_id=:owner_id and ROWID=:id", "args"=>array("owner_id"=>auth_controller::$current_user->id, "id"=>(int)$post->id)));
		if($this->post === null){
			view::set_user_message("Not Found");
			$this->status = new http_status(array("code"=>404, "message"=>"Post not found."));
			notification_center::publish("post_not_found", $this, $post);
			return;
		}
		
		$this->post->title = $post->title;
		$this->post->body = $post->body;
		if(strlen($post->publish_date) === 0) $this->post->publish_date = null;
		$this->post->url = strlen($post->url) === 0 ?  post::make_url($post) : post::sanitize_url($post);
		if(!is_numeric($this->post->publish_date)) $this->post->publish_date = strtotime($this->post->publish_date);
		$this->post->modified = gmmktime();
		$post_tags = array();
		if(strlen($tags) > 0){
			$tags = array_map(function($item){
				return string::sanitize(trim($item));
			}, explode(",", $tags));
			$existing_tags = storage::find_post_tags(
				array("where"=>"post_id=:id and owner_id=:owner_id"
					, "args"=>
						array("id"=>$post->id
							, "owner_id"=>$post->owner_id
						)
					)
				);
			if($existing_tags !== null){
				$post_tags = $existing_tags;
				$existing_tags = array_map(function($item){
					return $item->name;
				}, $existing_tags);
				$tags = array_values(array_filter($tags, function($item) use ($existing_tags){
					return !in_array($item, $existing_tags);
				}));				
			}
			foreach($tags as $key=>$tag){
				$post_tags[] = new post_tag(array("name"=>$tag, "owner_id"=>$post->owner_id));
			}
			$this->post->set_tags($post_tags);
		}
		$this->post->meta = meta::serialize($meta);
		notification_center::publish("should_save_post", $this, $this->post);
		if(in_array($this->url->file_type, array("html"))) self::redirect($this->post->url);
		$this->output = view::render("post/show", $this);
		return layout::render("default", $this);
	}
}
