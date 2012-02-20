<?php
class html_parser{
	static function before_saving_post($publisher, $post){
		$lines = explode("\n", $post->body);
		if($lines[0] === "html"){
			if($post->title !== null) return $post;
			$doc = new SimpleXMLElement(sprintf("<?xml version='1.0'?><html>%s</html>", $post->body));
			$post->title = $doc->h1[0];
		}
		return $post;
	}
	static function should_render_post($publisher, $post){
		$lines = explode("\n", $post->body);
		if($lines[0] === "html"){
			array_shift($lines);
			$html = array_reduce($lines, function($total, $item){return $total.$item;});
			$doc = DOMDocument::loadHTML(sprintf("%s", $html));
			$xpath = new DOMXPath($doc);
			$h1 = $xpath->query("//h1");
			if($h1->length >= 1){
				$post->title = $h1->item(0)->nodeValue;
				$h1->item(0)->parentNode->removeChild($h1->item(0));
			}
			$post->body = $doc->saveHTML();
		}
		return $post;
	}
}
filter_center::subscribe("before_saving_post", null, "html_parser::before_saving_post");
filter_center::subscribe("should_render_post", null, "html_parser::should_render_post");