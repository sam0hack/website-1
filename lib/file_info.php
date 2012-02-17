<?php
class file_info{
	function __construct($file_path){
		$this->file_path = $file_path;
		if(function_exists("finfo_open")){
			$finfo = finfo_open(FILEINFO_MIME_TYPE);
			$this->content_type = finfo_file($finfo, $file_path);
			finfo_close($finfo);
		}else{
			$parts = explode(".", $file_path);
			$this->content_type = $parts[count($parts)-1];
		}
	}
	public $file_path;
	public $content_type;
}