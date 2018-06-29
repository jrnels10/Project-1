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

	sizeCarouselItems("load");

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

	sizeCarouselItems("size");
};

var imageRatioArray = [];

function sizeCarouselItems(caller)
{
	////////////////////Size Carousel Items/////////////////////////////////
	if(window.innerWidth < 900)
	{
		var extraHeight = 195;
	}
	else
	{
		var extraHeight = 260;
	}

	var textHeightArray = [];
	var carouselHeight = $(".carousel")[0].offsetHeight - extraHeight;
	var imageHeightArray = [];

	var $carouselTextItem = [$("#item-text-jacob")[0],$("#item-text-andrew")[0],$("#item-text-steven")[0],$("#item-text-paulo")[0]];

	[0,1,2,3].forEach(function(i) {
	 	$carouselTextItem[i].style.height = "auto";
	});

	for(var carouselTextNumber in $carouselTextItem)
	{
		textHeightArray.push($carouselTextItem[carouselTextNumber].offsetHeight);
	}

	var $carouselImageItem = [$(".bio-pic")[0],$(".bio-pic")[1],$(".bio-pic")[2],$(".bio-pic")[3]];


	for(var carouselImageNumber in $carouselImageItem)
	{
		imageHeightArray.push($carouselImageItem[carouselImageNumber].offsetHeight);
	}

	imageHeightArray.map(function(height) {

		var imageIndex = imageHeightArray.indexOf(height);
  		imageHeightArray[imageIndex] = carouselHeight - textHeightArray[imageIndex];

		if(imageHeightArray[imageIndex] < 1)
		{
			imageHeightArray[imageIndex] = 1;
		}
	});

	textHeightArray.map(function(height) {

		var textIndex = textHeightArray.indexOf(height);
  		textHeightArray[textIndex] = carouselHeight - imageHeightArray[textIndex];

		if(textHeightArray[textIndex] + $carouselImageItem[textIndex].offsetTop > window.innerHeight)
		{
			$("body").css("overflow", "scroll");
		}
		else
		{
			$("body").css("overflow", "hidden");
		}

	});

	[0,1,2,3].forEach(function(i) {
 		$carouselTextItem[i].style.height = textHeightArray[i] + "px";
 		$carouselImageItem[i].style.height = imageHeightArray[i] + "px";

	});


	if(window.innerHeight < 644)
	{
		var currentLocation = $(".indicators")[0].offsetTop;
		var neededLocation = -5;
		var delta = currentLocation - neededLocation;

		$(".indicators").css("transform", "translateY(-" + delta + "px)");
	}
	else
	{
		$(".indicators").css("transform", "translateY(0px)");
	}

}
