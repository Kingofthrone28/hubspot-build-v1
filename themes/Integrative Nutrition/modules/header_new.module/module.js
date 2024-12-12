/** Add JS to handle going direct to checkout from promo banner */
(() => {
  const button = IIN.shopify.getPromoCheckoutButton();

  if (button) {
    IIN.shopify.updatePromoCheckoutButton(button);
  }

  // check for offset-header class. If present apply header padding
  const element = document.querySelector('main.offset-header');

  if (element) {
    IIN.utilities.configureBodyOffsetForHeader('.jd-header-wrap');
  }

  // Configure main menu nav
  $(document).click(function (event) {
    if (event.target.className !== 'jd-nav-item-title') {
      $('.jd-nav-item').removeClass('jd-nav-show');
    }
  });

  const { forEach } = Array.prototype;
  forEach.call(
    document.querySelectorAll('.nav-dropdown-trigger'),
    (trigger) => {
      trigger.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setTimeout(() => {
          const name = 'jd-nav-show';
          const parentClasses = event.target.parentNode.classList;
          const isShowing = parentClasses.contains(name);
          if (isShowing) {
            parentClasses.remove(name);
          } else {
            forEach.call(
              document.querySelectorAll('.jd-nav-item'),
              item => item.classList.remove(name)
            );
            parentClasses.add(name);
          }
        }, 50);
      });
    }
  );
})();
