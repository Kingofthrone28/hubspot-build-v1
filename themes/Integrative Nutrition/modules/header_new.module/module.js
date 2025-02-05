/** Add JS to handle going direct to checkout from promo banner */
const { forEach } = Array.prototype;
const button = IIN.shopify.getPromoCheckoutButton();

if (button) {
  IIN.shopify.updatePromoCheckoutButton(button);
}

// check for offset-header class. If present apply header padding
const element = document.querySelector('main.offset-header');

if (element) {
  IIN.utilities.configureBodyOffsetForHeader('.jd-header-wrap');
}

// Configure navigation menus to close on document click
const configureDropdownMenus = () => {
  const showClass = 'jd-nav-show';

  // We use getElements because we have two navs for each type,
  // one for mobile and one for desktop.
  const mainNavs = document.getElementsByClassName('main-nav');
  const contactNavs = document.getElementsByClassName('contact-nav');
  const getNavContains = (navElements) => (element) =>
    Array.prototype.some.call(navElements, (nav) => nav.contains(element));
  const mainNavContains = getNavContains(mainNavs);
  const contactNavContains = getNavContains(contactNavs);

  // Configure navs to close on global click
  document.addEventListener('click', (event) => {
    const clickedElement = event.target;
    const isInMainNav = mainNavContains(clickedElement);
    const isInContactNav = contactNavContains(clickedElement);

    if (!isInMainNav && !isInContactNav) {
      IIN.helpers.closeMenus();
    }
  });

  // Configure dropdown expansion and collapse
  const triggers = document.getElementsByClassName('nav-dropdown-trigger');
  forEach.call(triggers, (trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      setTimeout(() => {
        const parentClasses = event.target.parentNode.classList;
        const isShowing = parentClasses.contains(showClass);

        if (isShowing) {
          parentClasses.remove(showClass);
        } else {
          IIN.helpers.closeMenus();
          parentClasses.add(showClass);
        }
      }, 50);
    });
  });
};

configureDropdownMenus();
