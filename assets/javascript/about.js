$('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });

  window.onload = function () { 

    
  
  
    //check size for menu
    if(window.innerWidth <= 992)
    {
      if(window.innerWidth <= 600)
      {
        var styleHeight = 'style=\"height: 47px; line-height: 43px;\"';
      }
      else
      {
        var styleHeight = "";
      }
  
      $("body").append("<div id='hamburger' " + styleHeight + " onClick='menuTime()'>&#9776;</div>");
    }
  };

  var menuOnTheGrill = false;

function menuTime()
{
	if(menuOnTheGrill)
	{
		$("#hamburger-menu").css("animation", "none");
		setTimeout(function () { 
			$("#hamburger-menu").css("animation", "fadeInRight 250ms reverse forwards");
		}, 30);
		setTimeout("$('#hamburger-menu').remove(); menuOnTheGrill = false", 280);
		return;
	}
	else
	{
		menuOnTheGrill = true;
		$("body").append("<div id='hamburger-menu' style='height: 50px;'><div class='ham' onClick='window.location=\"index.html\"'>Home</div></div>");
	}
}

window.onresize = function () { 
	if(window.innerWidth <= 992)
	{
		if(window.innerWidth <= 600)
		{
			var styleHeight = 'style=\"height: 47px; line-height: 43px;\"';
		}
		else
		{
			var styleHeight = "";
		}

		if($("#hamburger")[0] === undefined)
		{
			$("body").append("<div id='hamburger' " + styleHeight + " onClick='menuTime()'>&#9776;</div>");
    }
    else {
      $('#hamburger').attr("style", styleHeight.substr(7, styleHeight.length -9))
    }
	}
	else
	{
		if($("#hamburger")[0] !== undefined)
		{
			$("#hamburger").remove();
		}
	}
};