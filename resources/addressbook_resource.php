<?php
class_exists("app_resource") || require("app_resource.php");
class addressbook_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	function GET(){
		$view = "addressbook/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}