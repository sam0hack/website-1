<?php
class_exists("app_resource") || require("resources/app_resource.php");
class not_found_resource extends app_resource{
	function __construct($request, $url){
		parent::__construct($request, $url);
	}
	public $requested_resource;
	function resource_not_found($publisher, $info){
		$this->requested_resource = $publisher;
		$this->request = $publisher->request;
		$this->url = $publisher->url;		
		$publisher->resource_name = "not_found_resource";
		return $this;
	}
	function PUT(){
		return $this->GET();
	}
	function DELETE(){
		return $this->GET();		
	}
	function POST(){
		return $this->GET();
	}
	function GET(){
		$this->status = new http_status(array("code"=>404, "message"=>$this->url->resource_name . " not found."));
		$this->output = view::render("index", $this);
		return layout::render("default", $this);
	}
}
filter_center::subscribe("resource_not_found", null, new not_found_resource(new request($_SERVER, $_REQUEST, $_FILES, $_POST, $_GET), null));
