/** Add JS to handle going direct to checkout from promo banner */
(() => {
  const button = IIN.shopify.getPromoCheckoutButton();

  if (!button) {
    return;
  }

  IIN.shopify.updatePromoCheckoutButton(button);
})();
