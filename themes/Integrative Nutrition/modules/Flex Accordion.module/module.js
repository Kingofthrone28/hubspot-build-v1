document
  .querySelectorAll('.flex-accordion-item .flex-accordion-label')
  .forEach((label) => {
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
      const topSpace = parseInt(element.getAttribute('data-top-space'));
      const container = element.closest('.dnd-column');

      if (container) {
        container.classList.add('flex-accordion-container');

        window.addEventListener('scroll', () => {
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
        });
      }
    });
});

/* only apply focus on tab */
let isTabPressed = false;

// Listen for keydown events on the whole document
document.addEventListener('keydown', (event) => {
  if (event.key === 'Tab') {
    isTabPressed = true;
  }
});

document.addEventListener('mousedown', () => {
  isTabPressed = false;
});

document.querySelectorAll('.flex-accordion-trigger').forEach((element) => {
  element.addEventListener('focus', () => {
    // Only allow focus if it was triggered by the Tab key
    if (!isTabPressed) {
      element.blur(); // Remove focus if not from a Tab keypress
    }
  });
});
