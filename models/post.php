<?php
class_exists("model") || require("model.php");
class post extends model{
	function __construct($args = array()){
		parent::__construct($args);
		$this->publish_date = gmmktime();
		$this->modified = gmmktime();
		$this->created = gmmktime();
	}
	public $id;
	public $title;
	public $body;
	public $publish_date;
	public $created;
	public $modified;
	public $owner_id;
	public $type;
}