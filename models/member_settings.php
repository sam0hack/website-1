<?php
class member_settings{
	function __construct($json = null){
		if($json !== null){
			$obj = json_decode($json);
			$props = get_object_vars($obj);
			foreach($props as $k=>$v){
				$this->$k = $v;
			}
		}
	}
	public $background_url;
}