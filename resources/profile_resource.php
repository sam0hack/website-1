<?php
class_exists("member") || require("models/member.php");
class_exists("app_resource") || require("app_resource.php");
class profile_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	public $member;
	function GET(){
		$this->member = site::$member;
		$this->output = view::render("profile/index", $this);
		return layout::render("default", $this);
	}
	function POST(){
		$this->member = site::$member;
		$this->output = view::render("profile/edit", $this);
		return layout::render("default", $this);
	}
	function PUT(member $member){
		$this->member = auth_controller::$current_user;
		$this->member->signin = $member->signin;
		if(count($member->password) > 0) $this->member->password = string::password($member->password);
		$this->member->in_directory = $member->in_directory;
		$this->member->timestamp = gmmktime();
		$this->member->colophon = $member->colophon;
		$this->member->name = $member->name;
		notification_center::publish("should_save_member", $this, $this->member);
		if(in_array($this->url->file_type, array("html"))) self::redirect("profile");
	}
}

/*public $id;
public $signin;
public $name;
public $password;
public $hash;
public $expiry;
public $in_directory;
public $is_owner;
public $created;
public $timestamp;
public $settings;
*/
