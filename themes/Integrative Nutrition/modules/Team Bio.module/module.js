$('.dropdown-bio .bio-label').click(function () {
  $(this).siblings('.bio-content').slideToggle('fast');
  $(this).toggleClass('open');
});
