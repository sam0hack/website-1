<?php
class_exists("app_resource") || require("app_resource.php");
class e3_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	function GET(){
		$this->output = view::render("e3/index", $this);
		return layout::render("default", $this);
	}
}
