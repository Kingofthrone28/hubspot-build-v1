(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('course_shopify_price');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.log(e);
    return;
  }

  IINShopifyClient.product.fetch(`gid://shopify/Product/${moduleData.productID}`).then(function(product) {
      let variant = product.variants[0];
      for(const v of product.variants) {
        if(v.available) {
          variant = v;
          break;
        }
      }
      console.log(product);
      console.log("PDP");
      console.log(variant);
  
      $('#course-shopify-price').text('$' + parseInt(variant.price.amount).toLocaleString());
      if(variant.compareAtPrice && variant.compareAtPrice.amount && variant.compareAtPrice.amount != variant.price.amount) {
        $('#course-shopify-compare').text('$' + parseInt(variant.compareAtPrice.amount).toLocaleString());
      }
    })
    .catch(e => { console.log(e); });
})();
