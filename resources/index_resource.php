<?php
class_exists("post") || require("models/post.php");
class_exists("app_resource") || require("app_resource.php");
class index_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		$this->posts = array();
	}
	public $posts;
	public $most_recent_post;
	function GET(){
		/*$this->title = site::$member->colophon;
		//$this->posts = storage::find_posts((object)array("where"=>"owner_id=:owner_id and status='public'", "args"=>array("owner_id"=>site::$member->id), "order_by"=>"publish_date desc"));
		$this->posts = post::find("select p.ROWID as id, p.title, p.body, p.publish_date, m.name as author from posts p inner join members m on m.ROWID = p.owner_id where p.owner_id = :owner_id and p.status='public' and p.publish_date <= current_timestamp order by p.publish_date desc", array("owner_id"=>site::$member->id));
		if($this->posts === null) $this->posts = array();
		*/
		$this->most_recent_post = storage::find_posts_one(array("where"=>"owner_id=:owner_id and status='public'", "args"=>array("owner_id"=>site::$member->id), "order_by"=>"publish_date desc"));
		if($this->most_recent_post !== null)  $this->posts = storage::find_posts(array("where"=>"ROWID != :id and owner_id=:owner_id and status='public'", "args"=>array("owner_id"=>site::$member->id, "id"=>$this->most_recent_post->id), "order_by"=>"publish_date desc"));
		$this->output = view::render("index/index", $this);
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
