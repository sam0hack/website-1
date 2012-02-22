<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("person") || require("models/person.php");
class_exists("group") || require("models/group.php");
class person_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(!auth_controller::is_authed()){
			view::set_user_message("Unauthorized");
			self::redirect("signin");
		}
	}
	public $person;
	function GET(){
		$id_from_url = (int)$this->url->params[1];
		$this->person = storage::find_people_one(array("where"=>"ROWID=:id and owner_id=:owner_id", "args"=>array("owner_id"=>auth_controller::$current_user->id, "id"=>$id_from_url)));
		if($this->person === null){
			view::set_user_message("Not Found");
			$this->status = new http_status(array("code"=>404, "message"=>"Person not found."));
		}
		$view = "person/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	function POST(person $person = null){
		$this->person = new person();
		if($person !== null){
			$this->person = storage::find_people_one(array("where"=>"owner_id=:owner_id and ROWID=:id", "args"=>array("owner_id"=>auth_controller::$current_user->id, "id"=>(int)$person->id)));			
		}
		$view = "person/edit";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	function PUT(person $person, $profile = array()){
		$this->person = storage::find_people_one(array("where"=>"owner_id=:owner_id and ROWID=:id", "args"=>array("id"=>$person->id)));
		$person->owner_id = (int)auth_controller::$current_user->id;
		$person->created = gmmktime();
		$this->person->profile = new profile($profile);
		notification_center::publish("should_save_person", $this, $this->person);
		if(in_array($this->url->file_type, array("html"))) self::redirect("addressbook");
		$this->output = view::render("person/show", $this);
		return layout::render("default", $this);
		
	}
}