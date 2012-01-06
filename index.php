<?php
date_default_timezone_set("US/Central");
ini_set("auto_detect_line_endings",true);
set_error_handler("error_handler", E_ALL);
set_exception_handler("exception_handler");

function error_handler($code, $message, $file, $line, $context){
	$value = "$message ($code): line = $line - $file<br /><br />";
	view::set_user_message($value);
}
function exception_handler($e){
	view::set_user_message($e->getMessage());
}
function storage_provider(){
	return "sixd.sqlite";//"data.sqlite";
}

require("chinchilla.php");
require("storage.php");
require("models/member.php");
class site{
	static $member;
	static $path;
	function parsing_url($publisher, $path){
		$parts = explode("/", $path);
		$name = $parts[0];
		if(!(bool)self::$member->is_owner){
			notification_center::publish("member_site_requested", $this, self::$member);
			array_shift($parts);
			$path = implode("/", $parts);
		}
		return $path;
	}
	function begin_request($publisher, $info){
		$first_part = explode("/", url_parser::get_r($info));
		$first_part = $first_part[0];
		self::$member = storage::find_members_one((object)array("where"=>"signin=:name", "args"=>array("name"=>$first_part)));		
		if(self::$member === null){
			self::$member = storage::find_members_one((object)array("where"=>"is_owner=1", null));		
		}
	}
	function will_need_site_title($publisher, $info){
		$settings = storage::find_settings_one(array("where"=>"key=:key and owner_id=:owner_id", "args"=>array("key"=>"site_title", "owner_id"=>self::$member->id)));
		$info = " 6d";
		if(count($settings) > 0) $info = $settings[0]->value;
		return $info;
	}
}

class repo{
	function __construct(){}
	private $connection_string;
	function should_save_post($publisher, $post){
		$db = new storage(array("table_name"=>"posts", "primary_key_field"=>"id", "connection_string"=>storage_provider()));
		$db->save(array($post));
	}
	function should_save_story($publisher, $story){
		$db = new storage(array("table_name"=>"stories", "primary_key_field"=>"id", "connection_string"=>storage_provider()));
		$db->save(array($story));
	}
	function should_save_member($publisher, $member){
		if($member->settings() !== null){
			$member->settings = json_encode($member->settings());
		}
		$db = new storage(array("table_name"=>"members", "primary_key_field"=>"id", "connection_string"=>storage_provider()));
		$db->save(array($member));
	}
}
class widget_controller{
	function before_rendering_view($publisher, $info){
		return $info;
	}
}
$plugin_controller = new plugin_controller();
filter_center::subscribe("before_rendering_view", null, new widget_controller());
filter_center::subscribe("will_need_site_title", null, new site());
filter_center::subscribe("parsing_url", null, new site());
filter_center::subscribe("before_rendering_view", null, $plugin_controller);
filter_center::subscribe("before_rendering_view", null, new theme_controller());
filter_center::subscribe("should_set_css_path", null, new theme_controller());
filter_center::subscribe("end_request", null, new output_compressor());
filter_center::subscribe("setting_parameter_from_request", null, new magic_quotes_remover());
filter_center::subscribe("setting_parameter_from_request", null, new object_populator_from_request());
notification_center::subscribe("begin_request", null, new site());
notification_center::subscribe("before_calling_http_method", null, new auth_controller());
notification_center::subscribe("begin_request", null, $plugin_controller);
$r = new repo();
notification_center::subscribe("should_save_post", null, $r);
notification_center::subscribe("should_save_story", null, $r);
notification_center::subscribe("should_save_member", null, $r);
$request_controller = new front_controller();
echo $request_controller->execute(new request($_SERVER, $_REQUEST, $_FILES, $_POST, $_GET));