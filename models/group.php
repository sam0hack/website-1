<?php
class_exists("model") || require("model.php");
class group extends model{
	function __construct($args = null){
		$this->created = gmmktime();
		$this->updated = gmmktime();
		parent::__construct($args);
	}
	public $id;
	public $name;
	public $created;
	public $updated;
	public $owner_id;
}