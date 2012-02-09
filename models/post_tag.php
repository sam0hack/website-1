<?php
class_exists("model") || require("model.php");
class post_tag extends model{
	function __construct($args = array()){
		parent::__construct($args);
	}
	public $id;
	public $name;
	public $post_id;
	public $owner_id;
}