<?php
class_exists("model") || require("model.php");
class peopl_in_groups extends model{
	function __construct($args = null){
		$this->created = gmmktime();
		parent::__construct($args);
	}
	public $id;
	public $group_id;
	public $created;
	public $person_id;
}