$(() => {
  function runItem(container, item, width, speed) {
    const runSpeed = (width * speed) / 100;

    container.animate({ left: -width }, runSpeed, 'linear', () => {
      container.append(item);
      container.css('left', '0');

      const firstChild = container.find('.logo-item:first-child');
      const firstWidth = firstChild.outerWidth();

      runItem(container, firstChild, firstWidth, speed);
    });
  }
  $('.logo-slider .slider-inside').each(function () {
    const firstChild = $(this).find('.logo-item:first-child');
    const firstWidth = firstChild.outerWidth();
    const speed = $(this).data('speed');

    runItem($(this), firstChild, firstWidth, speed);
  });
});
