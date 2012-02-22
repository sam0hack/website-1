<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("person") || require("models/person.php");
class_exists("group") || require("models/group.php");
class addressbook_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(!auth_controller::is_authed()){
			view::set_user_message("Unauthorized");
			self::redirect("signin");
		}
	}
	public $people;
	public $groups;
	function GET(){
		$this->groups = storage::find_groups(array("where"=>"owner_id=:owner_id", "args"=>array("owner_id"=>auth_controller::$current_user->id)));
		$this->people = storage::find_people(array("where"=>"owner_id=:owner_id", "args"=>array("owner_id"=>auth_controller::$current_user->id)));
		
		$view = "addressbook/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}