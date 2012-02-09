<?php
class_exists("model") || require("model.php");
class media extends model{
	function __construct($args = null){
		parent::__construct($args);
		$this->id = 0;
		$this->owner_id = 0;
	}
	public $description;
	public $id;
	public $owner_id;
	public $src;
	public $type;
	private static $images;
	public static $path = "media";
	private static function is_empty($path){
		$handle = opendir($path);
		$count = 0;
		while($count < 3){
			if(readdir($handle) === false){
				break;
			}
			$count++;
		}
		closedir($handle);
		return $count === 2;
	}
	private static function delete_empty_folder($file_name_with_path){
		$parts = explode(DIRECTORY_SEPARATOR, $file_name_with_path);
		array_pop($parts);
		$folder = implode(DIRECTORY_SEPARATOR, $parts);
		$files = scandir($folder);
		if(count($files) === 2){
			do{
				rmdir(implode(DIRECTORY_SEPARATOR, $parts));
				$name = array_pop($parts);				
			}while(self::is_empty(implode(DIRECTORY_SEPARATOR, $parts)));
		}
	}
	static function all_thumbnails($folder){
		$files = self::find_all($folder, "thumbnails");
		return $files;
	}
	static function explore($path){
		$paths = array();
		$folder = dir($path);
		if($folder != null){
			while (false !== ($entry = $folder->read())){
				if(strpos($entry, '.') !== 0){
					$file_name = $folder->path .'/'. $entry;
					$paths[] = new media(array("src"=>$file_name, "title"=>$file_name, "type"=>null));
				}
			}
			$folder->close();
		}
		return $paths;
	}
	private static function traverse($path, $pattern = null){
		$root = ($path == null ? self::$path : $path);
		if(!file_exists($root)){
			mkdir($root, 0777);
		}
		$folder = dir($root);
		if($folder != null){
			while (false !== ($entry = $folder->read())){
				if(strpos($entry, ".") !== 0){
					$file_name = $folder->path ."/". $entry;
					if(is_dir($file_name)){
						self::traverse($file_name, $pattern);						
					}else{
						if($pattern !== null && strpos($file_name, $pattern) === false) continue;
						self::$images[] = new media(array("src"=>$file_name, "title"=>$file_name));
					}
				}
			}
			$folder->close();
		}
	}		
	static function delete($file_name_with_path){
		$file_name_with_path = str_replace("/", DIRECTORY_SEPARATOR, $file_name_with_path);
		$did_delete = false;		
		if(file_exists($file_name_with_path)){
			$did_delete = unlink($file_name_with_path);
		}
		self::delete_empty_folder($file_name_with_path);
		return $did_delete;
	}
	static function find_all($path = null, $pattern = null){
		$root = ($path == null ? self::$path : $path);
		self::$images = array();
		if(file_exists($root)){
			self::traverse($root, $pattern);
		}
		return self::$images;
	}
	static function find_owned_by($owner_id){
		$medium = storage::find_media(array("where"=>"type='attachment' and owner_id=:owner_id", "args"=>array("owner_id"=> auth_controller::$current_user->id)));
		return $medium;
	}
	
}