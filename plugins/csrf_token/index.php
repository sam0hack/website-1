<?php
class csrf_token{
	function should_require_csrf_token($resource){
		if(method_exists($resource, "should_require_csrf_token")) return $resource->should_require_csrf_token();
		return true;
	}
	function after_rendering_layout($publisher, $info){
		if(!self::should_require_csrf_token($publisher)) return $info;
		if(strpos($info, "</form>") === false) return $info;
		//$salt = microtime(true).mt_rand(10000,90000);
		$token = self::get_csrf_token();
		if($token === null){
			$token = $this->get_hash();
			self::set_csrf_token($token);
		}
		$info = str_replace("</form>", "<input type=\"hidden\" name=\"_csrf_token\" value=\"$token\" />
</form>", $info);
		return $info;
		
	}
	function before_calling_http_method($publisher, $info){
		if(strtolower($publisher->request->server["REQUEST_METHOD"]) === "get") return $info;
		// 2011-12-03, jguerra: Not sure if i need to check for authorization here.
		//if(!auth_controller::is_authed()) return $info;
		if(!self::should_require_csrf_token($publisher)) return;
		$sent_token = null;
		$token = self::get_csrf_token();
		if($token === null){
			throw new Exception("Unauthorized");
		}
		if($publisher->request->post !== null && array_key_exists("_csrf_token", $publisher->request->post)){
			$sent_token = $publisher->request->post["_csrf_token"];
		}else if($publisher->request->put !== null && array_key_exists("_csrf_token", $publisher->request->put)){
			$sent_token = $publisher->request->put["_csrf_token"];			
		}
		// 2011-12-23, jguerra: + signs are being replaced by spaces in the POST/PUT so I'm replacing them here.
		//console::log("_csrf_token before replacing spaces = " . $sent_token);
		$sent_token = str_replace(" ", "+", $sent_token);
		//console::log("$token=$sent_token");
		if($token !== $sent_token){
			throw new Exception("Unauthorized");
		}
	}
	static function get_csrf_token(){
		return array_key_exists("_csrf_token", $_COOKIE) ? $_COOKIE["_csrf_token"] : null;
	}
	static function set_csrf_token($value){
		$expire = 0;
		$path = "/";
		$domain = resource::domain();
		$secure = false;
		$httponly = false;
		setcookie("_csrf_token", $value, $expire, $path, $domain, $secure, $httponly);
		$_COOKIE["_csrf_token"] = $value;
	}
	private function get_hash($bit_length = 128){
		if(strpos("WIN", PHP_OS) !== false){
			return md5(uniqid(rand(), 1));
		}
	    $fp = @fopen('/dev/random','rb');
	    if ($fp !== FALSE) {
	        $key = substr(base64_encode(@fread($fp,($bit_length + 7) / 8)), 0, (($bit_length + 5) / 6)  - 2);
	        @fclose($fp);
	        return $key;
	    }
	    return null;
	}
}

filter_center::subscribe("after_rendering_layout", null, new csrf_token());
notification_center::subscribe("before_calling_http_method", null, new csrf_token());