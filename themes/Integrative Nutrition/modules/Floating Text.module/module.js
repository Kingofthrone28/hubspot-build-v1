$(() => {
  $('.floating-text-content').each(function () {
    const topSpace = parseInt($(this).data('top-space'));
    const element = $(this);
    const container = element.closest('.dnd-column');

    container.css('position', 'relative');
    const handleScroll = () => {
      const windowTop = $(window).scrollTop();
      const containerTop = container.offset().top;
      const containerHeight = container.outerHeight();
      const elementHeight = element.outerHeight();

      if (windowTop > containerTop - topSpace) {
        let newTop = windowTop + topSpace - containerTop;
        const maxTop = containerHeight - elementHeight;

        if (newTop > maxTop) {
          newTop = maxTop;
        }

        element.css('top', `${newTop}px`);
      } else {
        element.css('top', '0');
      }
    };

    const delayMilliseconds = 5;
    $(window).on(
      'scroll',
      IIN.helpers.throttle(handleScroll, delayMilliseconds),
    );
  });
});
