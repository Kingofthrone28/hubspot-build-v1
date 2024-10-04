(function () {
  document.addEventListener('DOMContentLoaded', () => {
    const header = document.querySelector('.jd-header-wrap');
    const postShareElement = document.querySelector('.jd-post-share');
    const container = document.querySelector('.jd-post-content-container');
    const headerHeight = header.offsetHeight;
    const topSpace = headerHeight + 100;

    if (!container) {
      return;
    }

    const handleScroll = () => {
      const windowTop = window.scrollY;
      const containerTop = container.getBoundingClientRect().top + windowTop;
      const containerHeight = container.offsetHeight;
      const elementHeight = postShareElement.offsetHeight;

      if (windowTop > containerTop - topSpace) {
        let newTop = windowTop + topSpace - containerTop;
        const maxTop = containerHeight - elementHeight;

        if (newTop > maxTop) {
          newTop = maxTop;
        }

        postShareElement.style.top = `${newTop}px`;
      } else {
        postShareElement.style.top = '0';
      }
    };

    const delayMilliseconds = 5;
    window.addEventListener(
      'scroll',
      IIN.helpers.throttle(handleScroll, delayMilliseconds),
    );
  });
})();
