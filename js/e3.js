(function(){
	function init(){
		var should_show = window.location.search.substring(1).indexOf("e3menu=no") == -1;
		var buffer_image = new Image();
		buffer_image.src = "http://media1.gameinformer.com/images/hubs/E32011/e3_2011_logo.png?v=2";
		buffer_image.src = "http://media1.gameinformer.com/images/hubs/E32011/e3_2011_logo_1.png?v=2";
		buffer_image.src = "http://media1.gameinformer.com/images/hubs/E32011/e3_2011_logo_off.png?v=2";

		$(function(){
		//if(!should_show) return;
			(function(){
				var position = {top: 0, left: 0};//$(".header-fragments").offset();
				var menu = $("<div />").attr("id", "e3_menu");
				var e3_logo = $("<a />").attr({id:"e3_logo", href: "javascript:void(0);"}).css("top", position.top + "px").html("<span>E3 2011 Coverage</span>");
				var container = $("<div />").attr("class", "container");

				function open(){
					menu.animate({top: "-300px"}, "fast");
					$(e3_logo).animate({top: position.top + "px"}, "fast", function(){
		$(this).css("position", "absolute");
		});
					e3_logo.removeClass("opened");

				}
				function close(){
					e3_logo.addClass("opened");
					menu.animate({top: 0}, "fast");
					$(e3_logo).animate({top: "300px"}, "fast", function(){
		$(this).css("position", "fixed");
		});
				}
				function is_open(){
					return parseInt(menu.css("top").replace("px", "")) < 0;
				}

				$(e3_logo).click(function(e){
					e.preventDefault();
					e.stopPropagation();
					if(!is_open()){
						open();
					}else{
						$(this).css("position", "absolute");
						close();
					}
				});
				$(".header-fragments-header").after(menu);
				menu.after(e3_logo);
				// Tags=e32011
				var aj = $.ajax({url:"http://www.gameinformer.com/b/mainfeed.aspx?Tags=feature"
					, success: function(data, status, request){
						var doc = $("item", data);

						var items = doc.find("item");
						var title = null;
						var item = null;
						var img = null;
						var div = $("<div />").attr("class", "item");
						var description = null;
						var mathces = null;
						var link = null;
						doc.each(function(i){
							if(i < 4){
								title = $(this).find("title").text();
								description = $(this).find("description").text();
								link = $(this).find("link").text();
								matches = /src="([^"]+)"/.exec(description);
								img = new Image();
								img.src = matches[1];
								img.onload = function(e){
									var ar = this.width / this.height;
									this.height = 170;
									this.width = this.height * ar;
								};
								img.className = "e3";
								div.append($("<div />").attr("class", "photo").append($("<a />").attr({href: link + "?from=e3menu", title: title}).append(img)));
								div.append($("<h2 />").append($("<a />").attr({href: link + "?from=e3menu", title: title}).text(title)));
								container.append(div);
								div = $("<div />").attr("class", "item");
							}
						});
						var links = [{title: "E3 Hub", href: "/p/e32011.aspx?from=e3menu"}, {title: "E3 Live", href: "/p/e3live.aspx?from=e3menu"}, {title: "Microsoft", href:"/p/e32011ms.aspx?from=e3menu"}, {title: "Sony", href:"/p/e32011sony.aspx?from=e3menu"}, {title: "Nintendo", href:"/p/e32011nin.aspx?from=e3menu"}];
						var nav = $("<nav />");
						for(i = 0; i < links.length; i++){
							nav.append($("<a />").attr({title: links[i].title, href: links[i].href}).text(links[i].title));
						}
						menu.append(container);
						menu.append(nav);
						var sprint_logo = $("<a />").attr({id: "sprint_logo", href: "http://now.sprint.com/alltogethernow/", title: "Sprint - All Together Now"}).html("<span>Sprint - All Together Now</span>");
						menu.append(sprint_logo);
					}
					, error: function(request, status){
						console.log(status);
					}
					, dataType: "xml"
				});
			})();
		});	
	}

	var script = document.createElement("script");
	script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js";
	script.addEventListener('load', init);
	document.getElementsByTagName("head")[0].appendChild(script);

})();