$( document ).ready(function() {
  function run_item(container, item, width, speed){
    var run_speed = (width * speed)/ 100;
    container.animate({ left: -width }, run_speed, "linear", function()
          {
              container.append( item );
              container.css('left', '0');
              var first_child = container.find(".logo-item:first-child"),
              first_width = first_child.outerWidth();
              run_item(container, first_child, first_width, speed);
          });
  }
  $('.logo-slider .slider-inside').each(function() {
    var first_child = $(this).find(".logo-item:first-child"),
        first_width = first_child.outerWidth(),
        speed = $(this).data('speed');
    run_item($(this), first_child, first_width, speed);
  });
  
});