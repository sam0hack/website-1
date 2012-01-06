<html>
	<head>
		<title>Youtub Video Merging Prototype</title>
		<style type="text/css">
			body{
				background: rgb(0,0,0);
				color: rgb(50,50,50);
				text-align: center;
				font-family: "Bookman Old Style", Georgia, Serif;
			}
			#videos{
				position: relative;
				margin: 0 auto;
				text-align: center;
				height: 400px;
				width: 425px;
			}
			object{position: absolute;}
			#player_0{z-index: 2;left: 0;}
			#player_1{z-index: 1;left: 0;}
			#film_strip{
			}
			
			#searchResultsVideoList{
				width: 750px;
			}
			#searchResultsVideoList ul{
				width: 100%;
			}
			
			#searchResultsVideoList ul li{
				float: left;
			}
			#searchResultsVideoList ul li a{
				border: solid 5px transparent;
				display: block;
			}

			.centered {
				width:425px;
				height: 400px;
				position: absolute;
				top: 50%;
				left: 50%;
				margin-left: -212px;
				margin-top: -200px;
			}
			#searchResultsVideoList ul li a.selected{
				border: solid 5px rgb(255,255,255);
			}
			#slots img{
				width: 75px;
				height: 75px;
			}
		</style>
	</head>
	<body>
		<h1>Video Merging Prototype</h1>
		<p id="user_message"></p>
		<div id="slots">
			<img src="images/Youtube_64x64.png" id="slot0" rel="" />
			<img src="images/Youtube_64x64.png" id="slot1" rel="" />
		</div>
		<div id="videos">
					
			<object type="application/x-shockwave-flash" width="425" height="344" id="player_0" data="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_0" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase=""http://macromedia.com/cabs/swflash.cab#version=9,0,0,0">
				<param name="movie" value="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_0"></param>
				<param name="quality" value="high"></param>
				<param name="wmode" value="transparent"></param>
				<param name="allowFullScreen" value="true"></param>
				<param name="allowScriptAccess" value="always"></param>
				<embed src="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_0" quality="high" width="425" height="344" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" wmode="transparent" allowFullScreen="true" allowScriptAccess="always"></embed>
			</object>
	
	
			<object type="application/x-shockwave-flash" width="425" height="344" id="player_1" data="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_1" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase=""http://macromedia.com/cabs/swflash.cab#version=9,0,0,0">
				<param name="movie" value="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_1"></param>
				<param name="quality" value="high"></param>
				<param name="wmode" value="transparent"></param>
				<param name="allowFullScreen" value="true"></param>
				<param name="allowScriptAccess" value="always"></param>
				<embed src="http://www.youtube.com/apiplayer?enablejsapi=1&playerapiid=player_1" quality="high" width="425" height="344" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" wmode="transparent" allowFullScreen="true" allowScriptAccess="always"></embed>
			</object>

		</div>
		
		<div id="film_strip">
			<div id="searchResultsVideoList"></div>
			<form id="find_form" action="#" method="get">
				<input type="text" id="query" value="firefly" />
				<input type="submit" id="find_button" value="find" />
			</form>
			<input type="button" id="play_button" value="play" />
			<input type="button" id="previousPageButton" value="previous" />
			<input type="button" id="nextPageButton" value="next" />
		</div>		
		
	</body>
	<script type="text/javascript" language="javascript" src="js/mootools-1.2.3-core-nc.js"></script>
	<script type="text/javascript" language="javascript" src="js/mootools-1.2.3.1-more.js"></script>
	<script type="text/javascript" language="javascript" src="js/video_browser.js"></script>

	<script type="text/javascript">
		var player_0 = null;
		var player_1 = null;
		var counter = 0;
		var playing_0 = true;
		var playing_1 = false;
		var timer = new Date();
		var start_time = new Date();
		var stop_time = null;
		var running_time = 0;
		var intervalId = null;
		var swapped = 0;
		var distance = 0;
		var duration = 0;
		var page = 1;
		var switch_coefficient = 2;
		var videos = new Hash({});
		var v1 = null;
		var v2 = null;
		function observer(){
			timer = new Date();
			running_time = Math.floor((timer.getTime() - start_time.getTime()) / 1000);
			if(running_time % switch_coefficient == 1){
				start_time = new Date();
				swapped += 1;
				if(play_button.value == 'pause'){
					if(swapped % 2 > 0){
						player_0.playVideo();
						player_1.pauseVideo();
						player_0.style.zIndex = 2;
						player_1.style.zIndex = 1;
					}else{
						player_0.pauseVideo();
						player_1.playVideo();
						player_0.style.zIndex = 1;
						player_1.style.zIndex = 2;
					}
				}else{
					player_0.pauseVideo();
					player_1.pauseVideo();
				}
			}
		}
		function onYouTubePlayerReady(playerId){
			eval(playerId + '=' + '$("' + playerId + '")');
			counter += 1;
			if(counter >=2){
				videosDidLoad();
			}
		}
		
		function videosDidLoad(){
			player_0.addEventListener('onStateChange', 'player_0_onStateChange');
			player_1.addEventListener('onStateChange', 'player_1_onStateChange');
			intervalId = setInterval(observer, 250);			
			if(v1 != null){
				$('slot0').src = 'http://i.ytimg.com/vi/' + v1 + '/2.jpg';
				$('player_0').cueVideoById(v1, 0);
			}
			if(v2 != null){
				$('slot1').src = 'http://i.ytimg.com/vi/' + v2 + '/2.jpg';
				$('player_1').cueVideoById(v2, 0);
			}
		}
		function stopAll(){
			player_0.stopVideo();
			player_1.stopVideo();
		}
		function player_1_onStateChange(state){
			if(state == 0){
				clearInterval(intervalId);
				stopAll();
			}
			
			if(state == 1){
				if(player_1.getDuration() < duration){
					duration = player_1.getDuration();
					distance = 425/duration;
				}
				
			}
		}
		function player_0_onStateChange(state){
			if(state == 1){
				start_time = new Date();
				duration = player_0.getDuration();
				distance = 425/duration;
			}
			
			if(state == 5){
				stop_time = new Date();
			}
			if(state == 0){
				clearInterval(intervalId);
				stopAll();
			}
			
		}
		function videoWasSelected(img){
			var i = 0;
			var slots = null;
			videos.include($(img).get('rel'), img);
			for(i = 0; i < ytvb.selected.length; i++){
				$('slot' + i).src = videos.get(ytvb.selected[i]).src;
				$('player_' + i).cueVideoById(ytvb.selected[i], 0);
			}
		}
		function didListVideos(){
			var links = null;
			$A(ytvb.selected).each(function(key){
				links = $$('a[rel=' + key + ']');
				if(links.length > 0){
					links[0].addClass('selected');
				}
			});
			
		}
		function playVideo(e){
			play_button.value = (play_button.value == 'pause' ? 'play' : 'pause');
		}
		function findVideos(e){
			var query = $('query').value;
			ytvb.listVideos('all', query, page);
			return false;
		}
		function findNextVideos(e){
			page += 1;
			findVideos(e);
		}
		function findPreviousVideos(e){
			page -= 1;
			findVideos(e);
		}
		var container = $(ytvb.VIDEO_LIST_TABLE_CONTAINER_DIV);
		var play_button = $('play_button');
		window.addEvent('load', function() {
			var query_string = location.search.replace('\?', '').parseQueryString();
			if(query_string.v1){
				v1 = query_string.v1;
			}
			if(query_string.v2){
				v2 = query_string.v2;
			}
			container.addEvent('click', ytvb.videoWasSelected);
			ytvb.listVideos('all', $('query').value, 1);
			play_button.addEvent('click', playVideo);
			$('find_form').addEvent('submit', findVideos);
			$('nextPageButton').addEvent('click', findNextVideos);
			$('previousPageButton').addEvent('click', findPreviousVideos);
		});
		
	</script>

</html>