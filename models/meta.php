<?php
class_exists("model") || require("model.php");
class meta{
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