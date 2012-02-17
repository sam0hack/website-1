<?php
class_exists("member") || require("models/member.php");
class_exists("app_resource") || require("app_resource.php");
class members_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		$this->members = array();
	}
	public $members;
	function GET(){
		$view = "members/index";
		$this->members = storage::find_members(array("where"=>"in_directory=1"));
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}
