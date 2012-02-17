<?php
class url_slug{
	function __construct(){}
	function resource_not_found($publisher, $info){
		$resource_name = url_parser::get_r($publisher->request);
		$possible_slug = str_replace("_resource", "", $resource_name);
		$post = storage::find_posts_one(array("where"=>"url=:slug", "columns"=>"ROWID as id", "args"=>array("slug"=>$possible_slug)));
		if($post !== null){
			$publisher->request->request["post"]["id"] = $post->id;
			$publisher->request->request["r"] = "post";
			class_exists("post_resource") || require("resources/post_resource.php");
			return new post_resource($publisher->request, $publisher->url);
		}
		return $info;
	}
}
filter_center::subscribe("resource_not_found", null, new url_slug(), null);