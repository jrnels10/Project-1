$('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });
        

  // var nextSlide = function (){
  //   instance.set();
  //   setTimeout (nextSlide, 9000)

  // }


  setTimeout(autoplay, 15000);
  function autoplay() {
      $('.carousel').carousel('next');
      setTimeout(autoplay, 15000);
  }