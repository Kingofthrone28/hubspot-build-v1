(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('bundled_courses');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.log(e);
    return;
  }

  const bundleProducts = [];
  let priceString = '';
  const msToCloseAddPopUp = 5000;
  
  $(`#${moduleData.name} .bp-add-cart`).click(async function() {
    let cart;
    await IINShopifyClient.checkout.fetch(getCookie('shopifyCart'))
      .then(checkout => {
        cart = checkout;
      })
    let lineItemsToAdd = [];
    for(const product of bundleProducts) {
      let variant;
      for(const v of product.variants) {
        if(v.available) {
          let isMatch = true;
          for(const selectedOption of v.selectedOptions) {
            if(product.userSelectedOptions[selectedOption.name] != selectedOption.value) {
              isMatch = false;
            }
          }
          if(isMatch) {
            variant = v;
          }
        }
      }
      
      if(variant) {
        const existingLineItem = cart.lineItems.find(lineItem => {
          return lineItem.variant.product.id == product.id;
        });
        if(!existingLineItem) {
          lineItemsToAdd.push({
            variantId: variant.id,
            quantity: 1
          });
        }
      }
    }
    IINShopifyClient.checkout.addLineItems(getCookie('shopifyCart'), lineItemsToAdd)
        .then((checkout) => {
          updateCartTotal(checkout);
          $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
          $('.jd-blackout').addClass('jd-blackout-show');
          $('.jd-add-pop .jd-add-pop-name').text(moduleData.bundleName);
          $('.jd-add-pop .jd-add-pop-img > div').attr('style', 'background: url(' + checkout.lineItems[0].variant.image.src + ')');
          let optionsHTML = '';
          moduleData.courses.forEach((course) => {
            optionsHTML += `<div><b>${course.course_name}</b></div>`;
          });
          $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);
          $('.jd-add-pop .jd-add-pop-price').text('$' + priceString);

          $('.jd-add-pop').css('top', $('.jd-header-wrap').outerHeight() + 'px')
          $('.jd-add-pop').addClass('jd-add-pop-show');
          setTimeout(() => {
            $('.jd-blackout').removeClass('jd-blackout-show');
            $('.jd-add-pop').removeClass('jd-add-pop-show');
          }, msToCloseAddPopUp);
        })
  });
  
  function checkSelectedOptions(changedAttribute, product) {
    const options = {};
    for(const v of product.variants) {
      if(v.available) {
        let isValid = false;
        // Loading all for changed field
        for(const selectedOption of v.selectedOptions) {
          if(selectedOption.name == changedAttribute) {
            if(!options[selectedOption.name]) {
              options[selectedOption.name] = [ selectedOption.value ];
            } else if(!options[selectedOption.name].includes(selectedOption.value)) {
              options[selectedOption.name].push(selectedOption.value);
            }
            if(selectedOption.value == product.userSelectedOptions[changedAttribute]) {
              isValid = true;
            }
          }
        }
        // Only loading options if valid relative to the changed option
        if(isValid) {
          for(const selectedOption of v.selectedOptions) {
            if(selectedOption.name != changedAttribute) {
              if(!options[selectedOption.name]) {
                options[selectedOption.name] = [ selectedOption.value ];
              } else if(!options[selectedOption.name].includes(selectedOption.value)) {
                options[selectedOption.name].push(selectedOption.value);
              }
            }
          }
        }
      }
    }
    for(const key in options) {
      if(!options[key].includes(product.userSelectedOptions[key])) {
        product.userSelectedOptions[key] = options[key][0];
      }
    }
    console.log("OPTIONS");
    console.log(options);
    
    console.log("SELECTED OPTIONS");
    console.log(product.userSelectedOptions);
    
    let html = '';
    // Not showing options if there is only 1 default field
    if(options[product.optionKeys[0]][0] != 'Default Title') {
      html += '<div class="bp-options">';
      for(const o of product.optionKeys) {
        html += `<select data-shopify-option-type="${o}"><option disabled>${o}</option>`;
        for(let i = 0; i < options[o].length; i++) {
          const val = options[o][i];
          html += `<option ${val == product.userSelectedOptions[o] ? 'selected' : ''} value="${val}">${val}</option>`;
        }
        html += '</select>';
      }
      html += '</div>';
    }

    $(`#${moduleData.name} .bp-${product.id.replace('gid://shopify/Product/', '')} .bp-bundled-course-card-img`).css('background', `url('${product.images[0].src}')`);
    $(`#${moduleData.name} .bp-${product.id.replace('gid://shopify/Product/', '')} .bp-card-options`).html(html);
      
    // Option click
    $(`#${moduleData.name} .bp-${product.id.replace('gid://shopify/Product/', '')} select`).change(function() {
      const type = $(this).data('shopify-option-type');
      const val = $(this).val();
      product.userSelectedOptions[type] = val;
      checkSelectedOptions(type, product);
    });
  }
  
  IINShopifyClient.checkout.create().then(async (checkout) => {
    let lineItemsToAdd = [];
    for (const item of moduleData.courses) {
      if (item.product_id) {
        await IINShopifyClient.product.fetch(`gid://shopify/Product/${item.product_id}`).then(function(product) {
          for(const v of product.variants) {
            if(v.available) {
              lineItemsToAdd.push({
                variantId: v.id,
                quantity: 1
              });
              console.log(v);
              $(`.bp-${item.product_id} .bp-price`).text('$' + parseInt(v.price.amount).toLocaleString());
              break;
            }
          }
        })
      }
    }
  
    if(lineItemsToAdd.length) {
      await IINShopifyClient.checkout.addLineItems(checkout.id, lineItemsToAdd);
    }
  
    IINShopifyClient.checkout.fetch(checkout.id)
      .then(async checkout => {
        let totalAfterDiscount = parseFloat(checkout.totalPrice.amount);
        let total = totalAfterDiscount;
        if(checkout.discountApplications && checkout.discountApplications.length) {
          for(const discount of checkout.discountApplications) {
            total += parseFloat(discount.value.amount);
          }
        }
        priceString = totalAfterDiscount.toLocaleString();
        if(total == totalAfterDiscount) {
          $('#course-shopify-price').text('$' + total.toLocaleString());
        } else {
          const difference = total - totalAfterDiscount;
          $('#bundle-shopify-price-savings').html(`Savings of <span>$${difference.toLocaleString()}</span> by bundling together`);
          $('#course-shopify-price').text('$' + totalAfterDiscount.toLocaleString());
          $('#course-shopify-compare').text('$' + total.toLocaleString());
          $('#course-shopify-compare').show();
        }
        for(const line of checkout.lineItems) {
          IINShopifyClient.product.fetch(line.variant.product.id).then(function(product) {
            product.userSelectedOptions = {};
            product.optionKeys = [];
            let initialOptionToCheck;
            for(const v of product.variants) {
              if(v.available) {
                for(const selectedOption of v.selectedOptions) {
                  if(!initialOptionToCheck) {
                    initialOptionToCheck = selectedOption.name;
                    product.userSelectedOptions[selectedOption.name] = selectedOption.value;
                  }
                  // Keeping keys in array to preserve order
                  product.optionKeys.push(selectedOption.name);
                }
                break;
              }
            }
            bundleProducts.push(product);
            checkSelectedOptions(initialOptionToCheck, product);
          })
          .catch(e => { console.log(e); });
        }
    });
  
  });
})();
