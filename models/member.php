<?php
class_exists("model") || require("model.php");
class_exists("member_settings") || require("member_settings.php");
class member extends model{
	function __construct($args = null){
		$this->in_directory = false;
		parent::__construct($args);
	}
	public $id;
	public $signin;
	public $name;
	public $password;
	public $hash;
	public $expiry;
	public $in_directory;
	public $is_owner;
	public $created;
	public $colophon;
	public $timestamp;
	public $settings;
	function settings($value = null){
		if($this->settings === null) return new member_settings();
		return new member_settings($this->settings);			
	}
	function set_settings($key, $value){
		$member_settings = new member_settings();
		if($this->settings !== null){
			$member_settings = new member_settings($this->settings);
		}
		$member_settings->{$key} = $value;
		$this->settings = json_encode($member_settings);
	}
}
