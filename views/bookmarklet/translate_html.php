<h1>Translator Bookmarklet</h1>
<p>For some odd reason, I have a bunch of Twitter followers from South America. My name is Jose Guerra and Twitter handle is @joseguerra. And there happens to be a well known economics proffessor in Venezuela named Jose A. Guerra and many of my Twitter followers have mistaken me for him. I sent them messages telling them I was not the one they wanted. So while tweeting with them, I was contstantly going back and forth with Google Translator and thought, "I need a freakin' Twitter widget mashup with Google Translator to translate my tweets into spanish and tweet it". I looked for something, but didn't find anything. So I built one. And I made it into a bookmarklet. But THEN, Twitter changed the way they do authentication (no more Basic Auth support) which broke my implementation. So now the bookmarklet is just a Translator.</p>
<p>Drag the button below to your bookmarks toolbar and you're set to go. Just click on it and a Widget will popup.</p>

<a class="button" id="translator_link" style="width: 220px;" href="javascript:<?php echo rawurlencode("(function(){window['default_lan'] = 'es';var today=new Date();if(document.getElementById('__ttg_script') === null){var s=document.createElement('script');s.setAttribute('language','JavaScript');s.setAttribute('src','" .  resource::url_for(null) . "js/ttg.js?time=' + Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds()));s.id='__ttg_script';document.body.appendChild(s);}else{__ttg_widget.show();}})();");?>" title="Twitter Translator">
	<span>Translator</span>
	<span class="note">Drag this to your bookmarks toolbar</span>
</a>
<section id="instructionsForIE" style="display: none;">
<h1>Creating a Bookmarklet in Internet Explorer (IE)</h1>
<ol>
	<li><p>Copy this text:</p><textarea id="code" cols="60" rows="10"></textarea></li>
	<li>Then add this site to your favorites</li>
	<li>After adding this site to your favorites, view the properities for this new favorite that you just added</li>
	<li>Paste the text that you copied into the URL field</li>
	<li>Click the OK button</li>
	<li>Then click the Yes button when asked if you want to keep this target anyway</li>
	<li>You're new bookmarklet is ready to use. Go ahead, click on it</li>
</ol>
</section>

<!--<a class="button" style="width: 220px;" href="javascript:(function(){window['default_lan'] = 'es';var today=new Date();if(document.getElementById('__ttg_script') === null){var s=document.createElement('script');s.setAttribute('language','JavaScript');s.setAttribute('src','<?php echo resource::url_for(null);?>js/translate_all.js?time=' + Date.UTC(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours(), today.getMinutes(), today.getSeconds(), today.getMilliseconds()));s.id='__ttg_script';document.body.appendChild(s);}else{__ttg_widget.show();}})();" title="Translator">
	<span>Translate</span>
	<span class="note">Drag this to your bookmarks toolbar</span>
</a>
-->
<div id="movie_container"></div>

<script type="text/javascript">
	var link = document.getElementById('translator_link');
	var code = document.getElementById('code');
	var instructionsForIE = document.getElementById('instructionsForIE');
	code.innerHTML = link.href;
	if(window.attachEvent){
		link.innerHTML = '<span>Twitter Translator</span><span class="note">Follow directions to add this bookmarklet to your favorites</span>';
		instructionsForIE.style.display = 'block';
	}
	/*var movie = new Swiff('http://www.youtube.com/v/-bfTfjrupPI&color1=0xb1b1b1&color2=0xcfcfcf&hl=en_US&feature=player_detailpage&fs=1'
		, {id: 'movie', width: 640, height: 385, container: $('movie_container'), params: {name: 'movie', value: 'http://www.youtube.com/v/-bfTfjrupPI&color1=0xb1b1b1&color2=0xcfcfcf&hl=en_US&feature=player_detailpage&fs=1', allowScriptAccess: 'always'}
	});*/
</script>
<!--
<object width="640" height="385"><param name="movie" value="http://www.youtube.com/v/-bfTfjrupPI&color1=0xb1b1b1&color2=0xcfcfcf&hl=en_US&feature=player_detailpage&fs=1"></param><param name="allowFullScreen" value="true"></param><param name="allowScriptAccess" value="always"></param><embed src="http://www.youtube.com/v/-bfTfjrupPI&color1=0xb1b1b1&color2=0xcfcfcf&hl=en_US&feature=player_detailpage&fs=1" type="application/x-shockwave-flash" allowfullscreen="true" allowScriptAccess="always" width="640" height="385"></embed></object>
-->