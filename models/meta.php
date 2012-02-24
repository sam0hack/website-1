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
	
	static function serialize($value){
		return json_encode($value);
	}
	static function deserialize($value){
		return json_decode($value);
	}
}