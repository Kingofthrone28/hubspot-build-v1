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

  const buttons = document.querySelectorAll('.direct-to-cart');

  const addAndGo = async (lineItem, discountCode) => {
    const checkout = await getCheckoutById();
    const checkoutId = checkout.id;

    if (!checkout.id) {
      console.error(new Error('Failed to find checkout id'))
      return;
    }

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
