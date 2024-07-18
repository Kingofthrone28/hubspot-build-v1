$(() => {
  function run_item(container, item, width, speed) {
    const run_speed = (width * speed) / 100;
    container.animate({ left: -width }, run_speed, 'linear', () => {
      container.append(item);
      container.css('left', '0');
      const first_child = container.find('.logo-item:first-child');
      const first_width = first_child.outerWidth();
      run_item(container, first_child, first_width, speed);
    });
  }
  $('.logo-slider .slider-inside').each(function () {
    const first_child = $(this).find('.logo-item:first-child');
    const first_width = first_child.outerWidth();
    const speed = $(this).data('speed');
    run_item($(this), first_child, first_width, speed);
  });
});
