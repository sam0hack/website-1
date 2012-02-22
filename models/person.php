<?php
class_exists("model") || require("model.php");
class person extends model{
	function __construct($args = null){
		$this->created = gmmktime();
		$this->profile = new profile();
		parent::__construct($args);
	}
	public $id;
	public $name;
	public $created;
	public $profile;
	static function sanitize($key, $value){
		if($key === "name") return filter_var($value, FILTER_SANITIZE_STRING);
		return $value;
	}
}
class profile{
	function __construct($args = null){
		if($args !== null){
			foreach($args as $key=>$value){
				$this->{$key} = $value;
			}			
		}
	}
	static function sanitize($key, $value){
		if($key === "email") return filter_var($value, FILTER_SANITIZE_EMAIL);
		if($key === "url") return filter_var($value, FILTER_SANITIZE_URL);
		return $value;
	}
	
	function serialize(){
		return json_encode($this);
	}
	function deserialize(){
		return json_decode($this);
	}
}