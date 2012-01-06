<?php
class app_resource extends resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(auth_controller::is_authed()){
			$this->js .= $this->get_script_markup("imafreakinmember");
		}
	}
	function __destruct(){}
}
