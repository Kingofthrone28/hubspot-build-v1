/**
 * Configure blog nav mobile menu
 */
(function () {
  const menuParentItem = document.querySelector(
    '.blog-nav__menu--mobile .blog-nav__item--has-submenu',
  );
  const openItemClass = 'blog-nav__item--open';
  const openItemSelector = `.${openItemClass}`;
  const globalCloseTrigger = window;

  const closeMenu = (event) => {
    event.stopPropagation();
    document
      .querySelector(`${openItemSelector} > a`)
      ?.setAttribute('aria-expanded', 'false');
    document
      .querySelector(`${openItemSelector} > button`)
      ?.setAttribute('aria-expanded', 'false');
    document
      .querySelector(`${openItemSelector}`)
      .classList.remove(openItemClass);
    globalCloseTrigger.removeEventListener('click', closeMenu);
  };

  function openMenu(event) {
    event.stopPropagation();
    this.classList.add(openItemClass);
    this.querySelector('a').setAttribute('aria-expanded', 'true');
    this.querySelector('button').setAttribute('aria-expanded', 'true');
    globalCloseTrigger.addEventListener('click', closeMenu);
  }

  menuParentItem?.addEventListener('click', function (event) {
    if (this.classList.contains(openItemClass)) {
      closeMenu(event);
    } else {
      openMenu.call(this, event);
    }
  });
})();
