<?php
class_exists("member") || require("models/member.php");
class_exists("app_resource") || require("app_resource.php");
class settings_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	public $member;
	function GET(){
		$this->member = site::$member;
		$this->output = view::render("settings/index", $this);
		return layout::render("default", $this);
	}
	function POST(){
		$this->member = site::$member;
		$this->output = view::render("settings/edit", $this);
		return layout::render("default", $this);
	}
	
	function PUT(member $member){
		$this->member = auth_controller::$current_user;
		$this->member->in_directory = $member->in_directory;
		$this->member->timestamp = gmmktime();
		$this->member->colophon = $member->colophon;
		notification_center::publish("should_save_member", $this, $this->member);
		if(in_array($this->url->file_type, array("html"))) self::redirect("settings");
		$this->output = view::render("settings/index", $this);
		return layout::render("default", $this);
	}
	/*
	function GET(){
		$this->settings = storage::find_settings(null);
		$this->output = view::render("settings/index", $this);
		return layout::render("default", $this);
	}
	function POST(){
		$this->output = view::render("settings/edit", $this);
		return layout::render("default", $this);
	}*/
}
