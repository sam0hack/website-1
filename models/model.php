<?php
class model{
	function __construct($args = null){
		if($args !== null){
			foreach($args as $key=>$value){
				$this->$key = $value;
			}
		}
	}
	static function __callStatic($name, $args){
		if(strpos($name, "find") === false) throw new Exception("Not implemented");
		$name = str_replace("find_", "", $name);
		return storage::$name($args);
	}
}
