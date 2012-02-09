<?php
class_exists("model") || require("model.php");
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
	private $_tags;
	function get_tags(){
		return $this->_tags;
	}
	function set_tags($value){
		$this->_tags = $value;
	}
}
