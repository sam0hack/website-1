<?php
class_exists("app_resource") || require("app_resource.php");
class signout_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	function GET(){
		auth_controller::signout();
		$this->output = view::render("member/signin", $this);
		return layout::render("default", $this);
	}
}
