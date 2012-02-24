<?php
class_exists("app_resource") || require("app_resource.php");
class test{
	function get($key){
		console::log("getting $key");
		return $this->{$key};
	}
	function set($key, $value){
		$this->{$key} = $value;
	}
	function __get($key){
		console::log("getting $key");
		return $this->get($key);
	}
	function __set($key, $value){
		$this->set($key, $value);
	}
}
class test_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
		$this->title = "Testing";
	}
	public $test;
	function GET(){
		$this->test = new test();
		$this->test->name = "Some name";
		$properties = get_object_vars($this->test);
		console::log($this->test);
		$posts = storage::find_posts(null);
		$this->output = view::render("test/index", $this, array("posts"=>$posts));
		return layout::render("default", $this);			
	}
}
