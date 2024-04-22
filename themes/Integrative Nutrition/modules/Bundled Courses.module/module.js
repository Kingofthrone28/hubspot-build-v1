(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('bundled_courses');

    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.error(e);
    return;
  }

  const msToCloseAddPopUp = 5000;
  const bundleProducts = [];
  let priceString = '';

  const addToCart = async (bundleName, courses) => {
    const cartCookie = getCookie('shopifyCart');
    let cart;

    const lineItemsToAdd = [];

    try {
      cart = await IINShopifyClient.checkout.fetch(cartCookie);

      for (const product of bundleProducts) {
        let matchedVariant;

        for (const variant of product.variants) {
          if (variant.available) {
            let isMatch = true;

            for (const selectedOption of variant.selectedOptions) {
              if (
                product.userSelectedOptions[selectedOption.name] !==
                selectedOption.value
              ) {
                isMatch = false;
              }
            }

            if (isMatch) {
              matchedVariant = variant;
            }
          }
        }

        if (matchedVariant) {
          const existingLineItem = cart.lineItems.find(
            (lineItem) => lineItem.variant.product.id === product.id
          );

          if (!existingLineItem) {
            lineItemsToAdd.push({
              variantId: matchedVariant.id,
              quantity: 1,
            });
          }
        }
      }
    } catch (e) {
      console.error(e);
    }

    if (!lineItemsToAdd.length) {
      return;
    }

    try {
      const checkout = await IINShopifyClient.checkout.addLineItems(
        cartCookie,
        lineItemsToAdd
      );

      updateCartTotal(checkout);
      $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
      $('.jd-blackout').addClass('jd-blackout-show');
      $('.jd-add-pop .jd-add-pop-name').text(bundleName);

      $('.jd-add-pop .jd-add-pop-img > div').attr(
        'style',
        `background: url('${checkout.lineItems[0].variant.image.src}')`
      );

      let optionsHTML = '';

      Object.entries(courses).forEach(([, value]) => {
        const courseName = value.course_name;

        if (courseName) { 
          optionsHTML += `<div><strong>${courseName}</strong></div>`;
        }
      });

      $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);
      $('.jd-add-pop .jd-add-pop-price').text(`$${priceString}`);
      $('.jd-add-pop').css('top', `${$('.jd-header-wrap').outerHeight()}px`);
      $('.jd-add-pop').addClass('jd-add-pop-show');

      setTimeout(() => {
        $('.jd-blackout').removeClass('jd-blackout-show');
        $('.jd-add-pop').removeClass('jd-add-pop-show');
      }, msToCloseAddPopUp);
    } catch (e) {
      console.error(e);
    }
  };

  const checkSelectedOptions = (changedAttribute, product) => {
    const options = {};

    for (const variant of product.variants) {
      if (variant.available) {
        let isValid = false;

        // Loading all for changed field
        for (const selectedOption of variant.selectedOptions) {
          if (selectedOption.name === changedAttribute) {
            if (!options[selectedOption.name]) {
              options[selectedOption.name] = [selectedOption.value];
            } else if (
              !options[selectedOption.name].includes(selectedOption.value)
            ) {
              options[selectedOption.name].push(selectedOption.value);
            }

            if (
              selectedOption.value ===
              product.userSelectedOptions[changedAttribute]
            ) {
              isValid = true;
            }
          }
        }

        // Only loading options if valid relative to the changed option
        if (isValid) {
          for (const selectedOption of variant.selectedOptions) {
            if (selectedOption.name !== changedAttribute) {
              if (!options[selectedOption.name]) {
                options[selectedOption.name] = [selectedOption.value];
              } else if (
                !options[selectedOption.name].includes(selectedOption.value)
              ) {
                options[selectedOption.name].push(selectedOption.value);
              }
            }
          }
        }
      }
    }

    const updatedProduct = { ...product };

    for (const key in options) {
      if (!options[key].includes(product.userSelectedOptions[key])) {
        [updatedProduct.userSelectedOptions[key]] = options[key];
      }
    }

    console.log('OPTIONS');
    console.log(options);

    console.log('SELECTED OPTIONS');
    console.log(updatedProduct.userSelectedOptions);

    let html = '';

    // Not showing options if there is only 1 default field
    if (options[updatedProduct.optionKeys[0]][0] !== 'Default Title') {
      html += '<div class="bp-options">';

      for (const optionKey of updatedProduct.optionKeys) {
        html += `<select data-shopify-option-type="${optionKey}">`;
        html += `<option disabled>${optionKey}</option>`;

        for (let i = 0; i < options[optionKey].length; i++) {
          const value = options[optionKey][i];

          html += `
            <option
              value="${value}"
              ${
                value === updatedProduct.userSelectedOptions[optionKey]
                  ? 'selected'
                  : ''
              }
            >
              ${value}
            </option>
          `;
        }

        html += '</select>';
      }

      html += '</div>';
    }

    const productID = updatedProduct.id.replace('gid://shopify/Product/', '');

    $(`#${moduleData.name} .bp-${productID} .bp-bundled-course-card-img`).css(
      'background',
      `url('${updatedProduct.images[0].src}')`
    );

    $(`#${moduleData.name} .bp-${productID} .bp-card-options`).html(html);

    // Option click
    $(`#${moduleData.name} .bp-${productID} select`).change(function () {
      const type = $(this).data('shopify-option-type');
      const value = $(this).val();

      updatedProduct.userSelectedOptions[type] = value;
      checkSelectedOptions(type, updatedProduct);
    });
  };

  const addBundleProduct = async (productID) => {
    try {
      const product = await IINShopifyClient.product.fetch(productID);
      let initialOptionToCheck;

      product.userSelectedOptions = {};
      product.optionKeys = [];

      for (const variant of product.variants) {
        if (variant.available) {
          for (const selectedOption of variant.selectedOptions) {
            if (!initialOptionToCheck) {
              initialOptionToCheck = selectedOption.name;
              product.userSelectedOptions[selectedOption.name] =
                selectedOption.value;
            }

            // Keeping keys in array to preserve order
            product.optionKeys.push(selectedOption.name);
          }

          break;
        }
      }

      bundleProducts.push(product);
      checkSelectedOptions(initialOptionToCheck, product);
    } catch (e) {
      console.error(e);
    }
  };

  const getLineItem = async (productID) => {
    let lineItem;

    if (!productID) {
      return lineItem;
    }

    try {
      const gidPath = `gid://shopify/Product/${productID}`;
      const product = await IINShopifyClient.product.fetch(gidPath);

      for (const variant of product.variants) {
        if (variant.available) {
          lineItem = {
            variantId: variant.id,
            quantity: 1,
          };

          const formattedAmount = `$${parseInt(
            variant.price.amount
          ).toLocaleString()}`;

          // TODO: move this side effect
          $(`.bp-${productID} .bp-price`).text(formattedAmount);
          break;
        }
      }
    } catch (e) {
      console.error(e);
    }

    return lineItem;
  };

  const getLineItemsToAdd = async (courses) => {
    const promises = [];

    for (const course of courses) {
      const productID = course.product_id;
      const promise = getLineItem(productID);

      promises.push(promise);
    }

    const responses = await Promise.all(promises);
    const lineItemsToAdd = [];

    responses.forEach((response) => {
      if (response) {
        lineItemsToAdd.push(response);
      }
    });

    return lineItemsToAdd;
  };

  const createCheckout = async (courseData) => {
    const checkout = await IINShopifyClient.checkout.create();
    const courses = [];

    Object.values(courseData).forEach((value) => {
      if (value) {
        courses.push(value);
      }
    });

    const lineItemsToAdd = await getLineItemsToAdd(courses);

    if (lineItemsToAdd.length) {
      await IINShopifyClient.checkout.addLineItems(checkout.id, lineItemsToAdd);
    }

    const existingCheckout = await IINShopifyClient.checkout.fetch(checkout.id);
    const totalAfterDiscount = parseFloat(existingCheckout.totalPrice.amount);
    let total = totalAfterDiscount;

    if (existingCheckout.discountApplications?.length) {
      for (const discount of existingCheckout.discountApplications) {
        total += parseFloat(discount.value.amount);
      }
    }

    priceString = totalAfterDiscount.toLocaleString();

    if (total === totalAfterDiscount) {
      $('#course-shopify-price').text(`$${total.toLocaleString()}`);
    } else {
      const difference = total - totalAfterDiscount;

      $('#bundle-shopify-price-savings').html(
        `Savings of <span>$${difference.toLocaleString()}</span> by bundling together`
      );
      $('#course-shopify-price').text(
        `$${totalAfterDiscount.toLocaleString()}`
      );
      $('#course-shopify-compare').text(`$${total.toLocaleString()}`);
      $('#course-shopify-compare').show();
    }

    for (const line of existingCheckout.lineItems) {
      const productID = line?.variant?.product?.id;

      addBundleProduct(productID);
    }
  };

  createCheckout(moduleData.courses);

  $(`#${moduleData.name} .bp-add-cart`).click(() => {
    const { bundleName, courses } = moduleData;

    addToCart(bundleName, courses);
  });
})();
