<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("media") || require("models/media.php");
class thumbnails_resource extends app_resource{
	public function __construct($request, $url){
		parent::__construct($request, $url);
		if(!auth_controller::is_authed()){
			view::set_user_message("You're not authorized for this resource.");
			resource::redirect("signin");
		}
	}
	public $folders;
	function GET($year = null, $month = null, $day = null, $rest = null){
		$this->title = "Thumbnails";
		$view = "thumbnail/index";
		$path = null;
		$user_path = "media/" . auth_controller::current_user()->signin;
		$this->folders = array();
		$path = $user_path;
		if($year != null){
			$path .= "/$year";
			if($month !== null){
				$path .= "/$month";
				if($day !== null){
					$path .= "/$day";
				}
			}
		}
		if($rest !== null) $path .= "/$rest";
		if(is_dir($path)){
			$this->folders = media::all_thumbnails($path);
			foreach($this->folders as $key=>$value){
				$this->folders[$key]->src = str_replace("$user_path", resource::url_for("photos"), $value->src);
			}
		}
		if(in_array($this->url->file_type, array("jpg", "png", "gif", "tiff"))){
			$parts = explode("/", url_parser::get_r($this->request));
			if(count($parts) > 5) $path .= "/" . $parts[count($parts)-1];
			$finfo = finfo_open(FILEINFO_MIME_TYPE);
			$info = finfo_file($finfo, resource::get_absolute_path() . "/$path");
			finfo_close($finfo);
			$this->output = file_get_contents($path);
			$this->headers[] = new http_header(array("Content-Type"=>$info));
			$this->headers[] = new http_header(array("Accept-Ranges"=>"bytes"));
			$this->headers[] = new http_header(array("Content-Length"=>filesize($path)));
			$this->headers[] = new http_header(array("Last-Modified"=>gmdate("D, d M Y G:i:s T", filemtime($path))));
			return $this->output;
		}
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
}