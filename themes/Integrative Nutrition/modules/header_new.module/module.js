/** Add JS to handle going direct to checkout from promo banner */
(() => {
  const button = IIN.shopify.getPromoCheckoutButton();

  if (!button) {
    return;
  }

  IIN.shopify.updatePromoCheckoutButton(button);

  // check for offset-header class. If present apply header padding
  const element = document.querySelector('main.offset-header');

  if (element) {
    IIN.utilities.configureBodyOffsetForHeader('.jd-header-wrap');
  }
})();
