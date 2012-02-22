<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("person") || require("models/person.php");
class people_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		if(!auth_controller::is_authed()){
			view::set_user_message("Unauthorized");
			self::redirect("signin");
		}
	}
	public $people;
	function POST(person $person, $profile = array()){
		$person->owner_id = (int)auth_controller::$current_user->id;
		$person->created = gmmktime();
		$this->person = $person;
		$this->person->profile = new profile($profile);
		notification_center::publish("should_save_person", $this, $this->person);
		if(in_array($this->url->file_type, array("html"))) self::redirect("addressbook");
		$this->output = view::render("person/show", $this);
		return layout::render("default", $this);
	}
	function DELETE(person $person){
		$this->person = storage::find_people_one(array("where"=>"owner_id=:owner_id and ROWID=:id", "args"=>array("owner_id"=>auth_controller::$current_user->id, "id"=>$person->id)));
		if($this->person === null){
			$this->status = new http_status(array("code"=>404, "message"=>"Person was not found"));
		}else{
			notification_center::publish("should_delete_person", $this, $this->person);
			$this->status = new http_status(array("code"=>200, "message"=>"Person was deleted"));
			view::set_user_message("Person was deleted");
		}
		if($this->url->file_type === "html") self::redirect(null);
		$view = "addressbook/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}