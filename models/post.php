<?php
class_exists("model") || require("model.php");
class_exists("post_tag") || require("post_tag.php");
class post extends model{
	function __construct($args = array()){
		$this->publish_date = gmmktime();
		$this->modified = gmmktime();
		$this->created = gmmktime();
		$this->_tags = array();
		parent::__construct($args);
	}
	public $id;
	public $title;
	public $body;
	public $status;
	public $publish_date;
	public $created;
	public $modified;
	public $owner_id;
	public $type;
	public $settings;
	public $url;
	
	private $_settings;
	static function find($sql, $obj){
		$db = new storage(array("table_name"=>"posts", "primary_key_field"=>"id"));
		$posts = $db->query($sql, $obj, function($obj){
			$props = get_object_vars($obj);
			$new_object = new post();
			foreach($props as $k=>$v){
				if($k === "settings") $v = json_decode($v);
				$new_object->$k = $v;
			}
			return $new_object;
		});
		return $posts;
	}
	static function summary($post){
		if($post->settings !== null) return $post->settings->summary;
		return $post->body;
	}
	static function get_title($post){
		if($post->title !== null) return $post->title;
		$doc = new SimpleXMLElement(sprintf("<?xml version='1.0'?><document>%s</document>", $post->body));
		return $doc->h1;
	}
	static function get_body($post){
		$doc = DOMDocument::loadHTML(sprintf("<html>%s</html>", $post->body));
		$xpath = new DOMXPath($doc);
		$h1 = $xpath->query("//h1");
		if($h1->length >= 1){
			$h1->item(0)->parentNode->removeChild($h1->item(0));
		}
		return $doc->saveHTML();
	}
	private $_tags;
	function get_tags(){
		if(count($this->_tags) > 0) return $this->_tags;
		$this->_tags = storage::find_post_tags(array("where"=>"post_id=:id and owner_id=:owner_id", "args"=>array("id"=>$this->id, "owner_id"=>$this->owner_id)));
		return $this->_tags;
	}
	function set_tags($value){
		$this->_tags = $value;
	}
	static function make_url(post $post){
		$title = $post->title;
		if(strlen($post->title) > 0){
			$title = preg_replace("/[\s\.]+/", "-", strip_tags($post->title));
			$title = preg_replace("/[&\"\',]+/", "", $title);
			$title = strtolower($title);
		}
		return $title;
	}
	static function sanitize_url(post $post){
		if(strlen($post->url) === 0) return null;
		$url = preg_replace("/[\s+]/", "-", strip_tags($post->url));
		return $url;
	}
	static function sanitize_name(post $post){
		$name = preg_replace("/[\s+]/", "", strip_tags($post->name));
		return $name;
	}
}
