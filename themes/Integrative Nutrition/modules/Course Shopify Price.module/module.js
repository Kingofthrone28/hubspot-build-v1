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

      const marchedCompareAtPrice = matchedVariant.compareAtPrice?.amount;
      const matchedPrice = matchedVariant.price.amount;

      $('#course-shopify-price').text(
        `$${parseInt(matchedPrice).toLocaleString()}`
      );

      if (marchedCompareAtPrice && marchedCompareAtPrice !== matchedPrice) {
        $('#course-shopify-compare').text(
          `$${parseInt(matchedVariant.compareAtPrice.amount).toLocaleString()}`
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  setPrice();
})();
