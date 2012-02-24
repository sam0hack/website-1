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
	echo $e;
	view::set_user_message($e);
}
class_exists("chinchilla") || require("chinchilla.php");
class_exists("storage") || require("storage.php");
class_exists("mmember") || require("models/member.php");
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
	static function begin_request($publisher, $info){
		$first_part = explode("/", url_parser::get_r($info));
		$first_part = $first_part[0];
		self::$member = storage::find_members_one((object)array("where"=>"signin=:name", "args"=>array("name"=>$first_part)));		
		if(self::$member === null){
			self::$member = storage::find_members_one((object)array("where"=>"is_owner=1", null));		
		}
	}
	static function will_need_site_title($publisher, $info){
		if(site::$member->settings()->site_title){
			$info = site::$member->settings()->site_title;
		}
		return $info;
	}
}

class repo{
	static function need_storage_connection_string($publisher, $info){
		return resource::get_absolute_path("sixd.sqlite");
	}
	static function should_save_post($publisher, $post){
		if(strpos($post->body, chr(13) . chr(10)) > -1) $post->body = str_replace(chr(13) . chr(10), chr(10), $post->body);
		$post = filter_center::publish("before_saving_post", null, $post);
		if($post->meta !== null){
			$post->meta = $post->meta->serialize();
		}
		$tags = $post->get_tags();
		$db = new storage(array("table_name"=>"posts"));
		$list = $db->save(array($post));
		$db = new storage(array("table_name"=>"post_tags"));
		for($i = 0; $i < count($tags); $i++){
			$tags[$i]->post_id = $list[0][0]->id;
		}
		$db->save($tags);
		$post = filter_center::publish("after_saving_post", null, $post);
	}
	static function should_delete_post($publisher, $post){
		$post = filter_center::publish("before_deleting_post", null, $post);
		$tags_db = new storage(array("table_name"=>"post_tags"));
		$db = new storage(array("table_name"=>"posts"));
		$tags_db->delete(array("post_id"=>(int)$post->id, "owner_id"=>(int)$post->owner_id), "post_id=:post_id and owner_id=:owner_id");
		$db->delete(array("id"=>(int)$post->id, "owner_id"=>(int)$post->owner_id), "ROWID=:id and owner_id=:owner_id");
		$post = filter_center::publish("after_deleting_post", null, $post);
	}
	static function should_save_member($publisher, $member){
		$member = filter_center::publish("before_saving_member", null, $member);
		if($member->settings() !== null){
			$member->settings = json_encode($member->settings());
		}
		$db = new storage(array("table_name"=>"members"));
		$db->save(array($member));
		$errors = $db->get_errors();
		if(count($errors) > 0 && $errors[0] !== "00000"){
			foreach($db->get_errors() as $error){
				view::set_user_message($error);
			}
		}
		$member = filter_center::publish("after_saving_member", null, $member);
	}
	static function should_save_person($publisher, $person){
		$person = filter_center::publish("before_saving_person", null, $person);
		if($person->profile !== null){
			$person->profile = $person->profile->serialize();
		}
		$db = new storage(array("table_name"=>"people"));
		$db->save(array($person));
		$errors = $db->get_errors();
		if(count($errors) > 0 && $errors[0] !== "00000"){
			foreach($db->get_errors() as $error){
				view::set_user_message($error);
			}
		}
		$person = filter_center::publish("after_saving_person", null, $person);
	}
}
class widget_controller{
	static function before_rendering_view($publisher, $info){
		return $info;
	}
}
class custom_resources{
	static function before_rendering_view($publisher, $info){
		if($publisher->url->file_type === "phtml"){
			if(!file_exists("custom/$info")){
				$info = str_replace(".phtml", ".html", $info);
			}
		}
		if(file_exists("custom/$info")){
			$info = "custom/$info";
		}
		return $info;
	}
	static function before_including_resource_file($publisher, $info){
		if(file_exists("custom/$info")){
			$info = "custom/$info";
		}
		return $info;
	}
}
filter_center::subscribe("should_set_js_path", null, "theme_controller::should_set_js_path");
filter_center::subscribe("before_including_resource_file", null, "custom_resources::before_including_resource_file");
filter_center::subscribe("before_rendering_view", null, "custom_resources::before_rendering_view");
filter_center::subscribe("need_storage_connection_string", null, "repo::need_storage_connection_string");
filter_center::subscribe("before_rendering_view", null, "widget_controller::before_rendering_view");
filter_center::subscribe("will_need_site_title", null, "site::will_need_site_title");
filter_center::subscribe("parsing_url", null, "site::parsing_url");
filter_center::subscribe("before_rendering_view", null, "plugin_controller::before_rendering_view");
filter_center::subscribe("before_rendering_view", null, "theme_controller::before_rendering_view");
filter_center::subscribe("should_set_css_path", null, "theme_controller::should_set_css_path");
filter_center::subscribe("end_request", null, "output_compressor::end_request");
filter_center::subscribe("setting_parameter_from_request", null, "object_populator_from_request::setting_parameter_from_request");
notification_center::subscribe("begin_request", null, "site::begin_request");
notification_center::subscribe("before_calling_http_method", null, "auth_controller::before_calling_http_method");
notification_center::subscribe("begin_request", null, "auth_controller::begin_request");
notification_center::subscribe("begin_request", null, "plugin_controller::begin_request");
notification_center::subscribe("should_save_post", null, "repo::should_save_post");
notification_center::subscribe("should_delete_post", null, "repo::should_delete_post");
notification_center::subscribe("should_save_member", null, "repo::should_save_member");
notification_center::subscribe("should_save_person", null, "repo::should_save_person");
$request_controller = new front_controller();
// This is where the response is rendered.
echo $request_controller->execute(new request($_SERVER, $_REQUEST, $_FILES, $_POST, $_GET));