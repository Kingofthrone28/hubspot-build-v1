(function () {
  document.querySelectorAll('.flex-accordion-trigger').forEach((label) => {
    label.addEventListener('click', function () {
      const accordionItem = this.closest('.flex-accordion-item');
      const accordionContent = accordionItem.querySelector(
        '.flex-accordion-content',
      );

      if (accordionItem.classList.contains('open')) {
        accordionItem.classList.remove('open');
        accordionContent.style.display = 'none';
        this.setAttribute('aria-expanded', 'false');
      } else {
        accordionItem.classList.add('open');
        accordionContent.style.display = 'block';
        this.setAttribute('aria-expanded', 'true');
      }
    });
  });

  document.addEventListener('DOMContentLoaded', () => {
    document
      .querySelectorAll('.flex-accordion-floating-text')
      .forEach((element) => {
        const topSpace = 210;
        const container = element.closest('.dnd-column');

        if (!container) {
          return;
        }

        container.classList.add('flex-accordion-container');

        const handleScroll = () => {
          const windowTop = window.scrollY;
          const containerTop =
            container.getBoundingClientRect().top + window.scrollY;
          const containerHeight = container.offsetHeight;
          const elementHeight = element.offsetHeight;

          if (windowTop > containerTop - topSpace) {
            let newTop = windowTop + topSpace - containerTop;
            const maxTop = containerHeight - elementHeight;

            if (newTop > maxTop) {
              newTop = maxTop;
            }

            element.style.top = `${newTop}px`;
          } else {
            element.style.top = '0';
          }
        };

        window.addEventListener('scroll', handleScroll);
      });
  });
})();
