(async () => {
  const {
    addDiscountToCheckout,
    addLineItemsToCheckout,
    buildGlobalProductVariantId,
    createCheckoutLineItem,
    getCheckoutById,
    getCheckoutCookie,
    goToCart,
  } = IIN.shopify;

  const cartId = getCheckoutCookie();
  const checkout = await getCheckoutById(cartId);

  if (!checkout.id) {
    return;
  }

  const checkoutId = checkout.id;
  const buttons = document.querySelectorAll('.direct-to-cart');

  const addAndGo = async (lineItem, discountCode) => {
    try {
      await addLineItemsToCheckout([lineItem], checkoutId);
      await addDiscountToCheckout(checkoutId, discountCode);
      goToCart();
    } catch (error) {
      console.error(error);
    }
  };

  buttons.forEach((button) => {
    const { discountCode, variantId } = button.dataset;
    const shopifyVariantId = buildGlobalProductVariantId(variantId);
    const lineItem = createCheckoutLineItem(shopifyVariantId);

    button.addEventListener('click', () => {
      addAndGo(lineItem, discountCode);
    });
  });
})();
