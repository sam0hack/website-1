<?php
class_exists("app_resource") || require("app_resource.php");
class_exists("media") || require("models/media.php");
class_exists("file_info") || require("lib/file_info.php");
class photos_resource extends app_resource{
	public function __construct($request, $url){
		parent::__construct($request, $url);
	}
	public $folders;
	public static $ALLOWED = array("image/jpg", "image/jpeg", "image/gif", "image/png");
	function POST($files){
		if(!auth_controller::is_authed()){
			view::set_user_message("You're not authorized to post to this resource.");
			resource::redirect("signin");
		}
		if($files === null) return null;
		$names = $files["name"];
		$types = $files["type"];
		$tmp_names = $files["tmp_name"];
		$errors = $files["error"];
		$sizes = $files["size"];
		$ubounds = count($names);
		$this->result = array();
		for($i = 0; $i < $ubounds; $i++){
			$name = $names[$i];
			$type = $types[$i];
			$tmp_name = $tmp_names[$i];
			$error = $errors[$i];
			$size = $sizes[$i];
			if($error === UPLOAD_ERR_OK){
				$result = $this->save_file((object)array("name"=>$name, "type"=>$type, "tmp_name"=>$tmp_name, "error"=>$error, "size"=>$size));
			}else if(in_array($error, array(UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE))){
				$result = (object)array("error"=>"File size is greater than the specified maximum allowed upload size.", "file_path"=>null);
			}else if($error === UPLOAD_ERR_PARTIAL){
				$result = (object)array("error"=>"The file upload was interrupted and was not completed.", "file_path"=>null);
			}else if($error === UPLOAD_ERR_NO_FILE){
				$result = (object)array("error"=>"No file was uploaded.", "file_path"=>null);
			}else if($error === UPLOAD_ERR_NO_TMP_DIR){
				$result = (object)array("error"=>"The temporary folder used to put the file is missing.", "file_path"=>null);
			}else if($error === UPLOAD_ERR_CANT_WRITE){
				$result = (object)array("error"=>"Failed to write the temporary file to disk.", "file_path"=>null);
			}else if($error === UPLOAD_ERR_EXTENSION){
				$result = (object)array("error"=>"An extension is stopping the file upload.", "file_path"=>null);
			}
			if($result->error === null){
				if(!in_array($type, array("mp4", "3gpp", "m4v", "x-m4v"))){
					$thumbnail_folder = explode("/", $result->file_path);
					array_pop($thumbnail_folder);
					$thumbnail_folder = implode("/", $thumbnail_folder) . "/thumbnails";
					if(!file_exists($thumbnail_folder)){
						mkdir($thumbnail_folder, 0777, true);
					}
					$thumbnail_file = photos_resource::generate_thumbnail($result->file_path, $thumbnail_folder);
					$result->file_path = str_replace("media/" . auth_controller::$current_user->signin, "photos", resource::url_for($thumbnail_file));
					//{"name":"'.$file['name'].'","type":"'.$file['type'].'","size":"'.$file['size'].'"}'						
				}
			}
			$this->result[] = (object)array("name"=>$name, "type"=>$type, "size"=>$size, "thumbnail_src"=>$result->file_path, "error"=>$result->error);
		}
		/*["name"]=>
	  ["type"]=>
	  string(10) "text/plain"
	  ["tmp_name"]=>
	  string(26) "/private/var/tmp/php7ObsWD"
	  ["error"]=>
	  int(0)
	  ["size"]=>*/
		$view = "photo/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	function GET($year = null, $month = null, $day = null, $rest = null){
		$this->title = "Photos";
		$view = "photo/index";
		$path = null;
		$path = "media/" . site::$member->signin;
		$this->folders = array();
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
		if(is_dir($path)) $this->folders = media::explore($path);
		if(in_array($this->url->file_type, array("jpg", "png", "gif", "tiff"))){
			$parts = explode("/", url_parser::get_r($this->request));
			if(count($parts) > 5) $path .= "/" . $parts[count($parts)-1];
			$info = new file_info(resource::get_absolute_path() . "/$path");
			$this->output = file_get_contents($path);
			$this->headers[] = new http_header(array("Content-Type"=>$info->content_type));
			$this->headers[] = new http_header(array("Accept-Ranges"=>"bytes"));
			$this->headers[] = new http_header(array("Content-Length"=>filesize($path)));
			$this->headers[] = new http_header(array("Last-Modified"=>gmdate("D, d M Y G:i:s T", filemtime($path))));
			return $this->output;
		}
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	function DELETE($paths){
		$this->result = array();
		$this->folders = array();
		foreach($paths as $file){
			media::delete(sprintf("media/%s/%s", auth_controller::$current_user->signin, $file));
			$parts = explode("/", $file);
			$file_name = array_pop($parts);
			$thumbnail = sprintf("media/%s/%s/thumbnails/%s", auth_controller::$current_user->signin, implode("/", $parts), $file_name);
			media::delete($thumbnail);
			$this->result[] = (object)array("name"=>$file_name, "thumbnail_src"=>$thumbnail, "error"=>null);
		}
		$view = "photo/index";
		$this->output = view::render($view, $this);
		return layout::render("default", $this);
	}
	
	private function save_file($file){
		//if(!in_array($file->type, self::$ALLOWED)) return (object)array("file_path"=>null, "error"=>"File type is not supported.");
		$error = null;	
		if(is_uploaded_file($file->tmp_name)){
			$file_type = $this->get_file_type($file);
			$file_path = $this->create_and_get_file_path($file, $file_type);
			$did_move = move_uploaded_file($file->tmp_name, $file_path);
			if($did_move === false){
				$error = "Failed to move the file to " . $file_path . ". You should check the folder permissions, making sure it is writable. The error number returned is " . $file->error;
			}
		}
		return (object)array("file_path"=>$file_path, "error"=>$error);
	}
	private function get_file_type($file){
		$file_type = explode("/", $file->type);
		$file_type = $file_type[1];
		$file_type = str_replace("jpeg", "jpg", $file_type);
		return $file_type;
	}
	static function file_type_from_path($path){
		$parts = explode(".", $path);
		if(count($parts) === 0) return null;
		return $parts[count($parts)-1];
	}
	private function get_upload_folder(){
		return sprintf("media/%s/%s", auth_controller::$current_user->signin, date("Y"));
	}
	private function create_and_get_file_path($file, $file_type){
		$file_name = preg_replace("/\.*/", "", uniqid(null, true));
		$folder = $this->get_upload_folder();
		if(!file_exists($folder)){
			mkdir($folder, 0777, true);
		}
		$folder .= sprintf("/%s", date("n"));

		if(!file_exists($folder)){
			mkdir($folder, 0777, true);
		}
		$folder .= sprintf("/%s", date("j"));
		if(!file_exists($folder)){
			mkdir($folder, 0777, true);
		}
		$path = sprintf("%s/%s.%s", $folder, $file_name, $file_type);
		return $path;
	}
	private function get_thumbnail_width($path){
		$size = getimagesize($path);
		return $size[0] / 4;
	}
	private static function make_thumbnail($file, $to_width = 200){
		$extension = pathinfo($file, PATHINFO_EXTENSION);
		$image = null;
		$fn_name = null;
		$errors = array();
		if(in_array($extension, array("jpg", "jpeg", "JPG"))){
			$image = imagecreatefromjpeg($file);
			$fn_name = "imagejpeg";
		}else if($extension == "png"){
			$image = imagecreatefrompng($file);
			$fn_name = "imagepng";
		}else if($extension == "gif"){
			$image = imagecreatefromgif($file);
			$fn_name = "imagegif";
		}else{
			$errors[] = "tried to make a thumbnail of $file and it's not supported";
		}
		if(count($errors) > 0) return (object)array("thumbnail"=>null, "type"=>$extension, "create_fn"=>$fn_name);
		$width = imagesx($image);
		$height = imagesy($image);
		$aspect_ratio = $width / $height;
		$to_height = $to_width / $aspect_ratio;
		$thumbnail = imagecreatetruecolor($to_width, $to_height);
		imagecopyresampled($thumbnail, $image, 0, 0, 0, 0, $to_width, $to_height, $width, $height);
		return (object)array("thumbnail"=>$thumbnail, "type"=>$extension, "create_fn"=>$fn_name);
	}
	static function generate_thumbnail($file_path, $thumbnail_folder){
		$thumbnail = self::make_thumbnail($file_path);
		$info = pathinfo($file_path);
		$file_path = $thumbnail_folder . "/" . $info["filename"] . "." . $info["extension"];
		if($thumbnail->create_fn !== null){
			call_user_func_array($thumbnail->create_fn, array($thumbnail->thumbnail, $file_path));			
		}
		return $file_path;
	}
}