(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('course_shopify_price');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.error(e);
    return;
  }

  const setPrice = async () => {
    try {
      const gidPath = `gid://shopify/Product/${moduleData.productID}`;
      const product = await IINShopifyClient.product.fetch(gidPath);
      let [matchedVariant] = product.variants;

      for (const variant of product.variants) {
        if (variant.available) {
          matchedVariant = variant;
          break;
        }
      }

      const matchedCompareAtPrice = matchedVariant.compareAtPrice?.amount;
      const matchedPrice = matchedVariant.price.amount;

      $('#course-shopify-price').text(
        `$${parseInt(matchedPrice).toLocaleString()}`
      );

      if (matchedCompareAtPrice && matchedCompareAtPrice !== matchedPrice) {
        $('#course-shopify-compare').text(
          `$${parseInt(matchedVariant.compareAtPrice.amount).toLocaleString()}`
        );
      }
      return [product, matchedVariant];
    } catch (e) {
      console.error(e);
    }
  };

  setPrice().then(([product, matchedVariant]) => {

    const variantID = matchedVariant.id;
    const itemPrice = matchedVariant.price.amount;
    const viewItemPayLoad = {
      event: 'view_item',
      ecommerce: {
        product_type: 'Individual',
        currency: matchedVariant.price.currencyCode,
        value: parseFloat(itemPrice),
        items: [{
          'item_id': moduleData.productID,
          'item_name': product.title,
          'item_type': product.productType || 'NA',
          'variant_id': variantID.match(/\/(\d+)$/)[1],
          'price': parseFloat(itemPrice),
          'sku': matchedVariant.sku || 'NA',
          'discount': parseFloat(product?.discountAllocations?.allocatedAmount?.amount) || 'NA',
          'quantity': product?.quantity || 1
        }]
      }
    };
    // Trigger View item tracking event
    triggerECommEvent(viewItemPayLoad);
  });
})();
