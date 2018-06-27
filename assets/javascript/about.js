$('.carousel.carousel-slider').carousel({
    fullWidth: true,
    indicators: true
  });
        

//AUTOPLAYING CAROUSEL ON PAGE LOAD
  setTimeout(autoplay, 15000);
  function autoplay() {
      $('.carousel').carousel('next');
      setTimeout(autoplay, 15000);
  }