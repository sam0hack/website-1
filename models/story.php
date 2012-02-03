<?php
class_exists("model") || require("model.php");
class story extends model{
	function __construct($args = array()){
		parent::__construct($args);
		$this->timestamp = gmmktime();
		
	}
	public $id;
	public $content;
	public $timestamp;
}