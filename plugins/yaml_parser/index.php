<?php
class yaml_parser{
	static function before_saving_post($publisher, $post){
		$lines = explode("\n", $post->body);
		if($lines[0] === "yaml"){
			class_exists("Spyc")||require("lib/spyc.php");
			$obj = (object)Spyc::YAMLLoad($post->body);
			$post->title = property_exists($obj, "title") ? $obj->title : $post->title;
			$post->publish_date = property_exists($obj, "publish_date") ? $obj->publish_date : $post->publish_date;
			$post->type = property_exists($obj, "type") ? $obj->type : $post->type;
			$post->summary = property_exists($obj, "summary") ? $obj->summary : $post->summary;
			if(property_exists($obj, "tags")){
				$tags = array_map(function($item){
					return new post_tag(array("name"=>$item));
				}, $obj->tags);
				$post->set_tags($tags);
			}
		}
		return $post;
	}
	static function should_render_post($publisher, $post){
		$lines = explode("\n", $post->body);
		if($lines[0] === "yaml"){
			class_exists("Spyc")||require("lib/spyc.php");
			$obj = (object)Spyc::YAMLLoad($post->body);
			$post->title = property_exists($obj, "title") ? $obj->title : $post->title;
			$post->publish_date = property_exists($obj, "publish_date") ? $obj->publish_date : $post->publish_date;
			$post->body = property_exists($obj, "body") ? $obj->body : $post->body;
			$post->type = property_exists($obj, "type") ? $obj->type : $post->type;
			$post->excerpt = property_exists($obj, "excerpt") ? $obj->excerpt : $post->excerpt;
			if(property_exists($obj, "tags")){
				$tags = array_map(function($item){
					return new post_tag(array("name"=>$item));
				}, $obj->tags);
				$post->set_tags($tags);
			}
		}
		return $post;
	}
}
filter_center::subscribe("before_saving_post", null, "yaml_parser::before_saving_post");
filter_center::subscribe("should_render_post", null, "yaml_parser::should_render_post");