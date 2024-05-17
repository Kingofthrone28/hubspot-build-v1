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

  const makeOptionHTML = ({ isDisabled, name, selectedValue, value }) => {
    let html = '';

    if (typeof name === 'undefined' && typeof value === 'undefined') {
      return html;
    }

    const isSelected = typeof value !== 'undefined' && value === selectedValue;

    html = `
      <option
        ${typeof value === 'undefined' ? '' : `value="${value}"`}
        ${isDisabled ? 'disabled' : ''}
        ${isSelected ? 'selected' : ''}
      >
        ${value || name}
      </option>
    `;

    return html;
  };

  const makeSelectHTML = ({ bundleProduct, isInvalid, options, optionKey }) => {
    let html = '';

    const optionValues = options[optionKey];

    if (!Array.isArray(optionValues) || !optionValues.length) {
      return html;
    }

    html += `<select data-shopify-option-type="${optionKey}">`;

    const defaultOptionHTML = makeOptionHTML({
      isDisabled: true,
      name: optionKey,
    });

    if (defaultOptionHTML) {
      html += defaultOptionHTML;
    }

    const selectedValue = bundleProduct.userSelectedOptions[optionKey];

    optionValues.forEach((value) => {
      const optionHTML = makeOptionHTML({ isInvalid, selectedValue, value });

      if (optionHTML) {
        html += optionHTML;
      }
    });

    html += '</select>';

    return html;
  };

  const makeOptions = (changedAttribute, bundleProduct) => {
    const options = {};

    const setOption = (name, value) => {
      const existingValues = options[name];

      if (!existingValues || !existingValues.length) {
        options[name] = [value];
      } else if (!existingValues.includes(value)) {
        options[name].push(value);
      }
    };

    const variants = bundleProduct?.variants;

    if (!Array.isArray(variants)) {
      return options;
    }

    variants.forEach(({ available, selectedOptions }) => {
      if (!available || !selectedOptions.length) {
        return;
      }

      let variantOptions = [];

      if (Array.isArray(selectedOptions)) {
        variantOptions = selectedOptions;
      }

      // First field all options are avaialable
      setOption(bundleProduct.optionKeys[0], variantOptions[0].value);

      if (bundleProduct.optionKeys.length < 2) {
        return;
      }

      // Each field after first checks every field before it in order adding
      // options for that field if the variant matches the previous selections
      for (let i = 1; i < bundleProduct.optionKeys.length; i++) {
        let isValid = true;

        for (let j = 0; j < i; j++) {
          if (
            bundleProduct.userSelectedOptions[bundleProduct.optionKeys[j]] !==
            variantOptions[j].value
          ) {
            isValid = false;
          }
        }

        if (isValid) {
          setOption(bundleProduct.optionKeys[i], variantOptions[i].value);
        }
      }
    });

    return options;
  };

  const checkSelectedOptions = (changedAttribute, bundleProduct) => {
    const updatedProduct = { ...bundleProduct };
    const options = makeOptions(changedAttribute, updatedProduct);

    Object.entries(options).forEach(([key, values]) => {
      const userSelectedValue = updatedProduct.userSelectedOptions?.[key];

      if (!values.includes(userSelectedValue)) {
        [updatedProduct.userSelectedOptions[key]] = values;
      }
    });

    let html = '';

    // Not showing options if there is only 1 default field
    const [firstOptionKey] = updatedProduct.optionKeys;
    const firstVariantTitle = options?.[firstOptionKey]?.[0];

    if (firstVariantTitle !== 'Default Title') {
      html += '<div class="bp-options">';

      updatedProduct.optionKeys.forEach((optionKey) => {
        const selectHTML = makeSelectHTML({
          options,
          optionKey,
          bundleProduct: updatedProduct,
        });

        if (selectHTML) {
          html += selectHTML;
        }
      });

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

      updatedProduct.userSelectedOptions[type] = $(this).val();
      checkSelectedOptions(type, updatedProduct);
    });
  };

  const addBundleProduct = async (productID) => {
    try {
      const product = await IINShopifyClient.product.fetch(productID);

      if (!product) {
        throw new Error('Product not could not be fetched.');
      }

      let initialOptionToCheck;

      const bundleProduct = { ...product };

      bundleProduct.optionKeys = [];
      bundleProduct.userSelectedOptions = {};

      const availableVariant = bundleProduct.variants.find((variant) => {
        const { available } = variant;
        const variantOptions = variant.selectedOptions;

        return Boolean(
          available && Array.isArray(variantOptions) && variantOptions.length
        );
      });

      const availableVariantOptions = availableVariant?.selectedOptions || [];

      availableVariantOptions.forEach((option) => {
        if (!initialOptionToCheck) {
          initialOptionToCheck = option.name;
        }

        // Keeping keys in array to preserve order
        bundleProduct.optionKeys.push(option.name);
        bundleProduct.userSelectedOptions[option.name] = option.value;
      });

      bundleProducts.push(bundleProduct);
      checkSelectedOptions(initialOptionToCheck, bundleProduct);
    } catch (e) {
      console.error(e);
    }
  };

  const addToCart = async (bundleName, courses) => {
    const cartCookie = IIN.cookies.getCookieString('shopifyCart');
    let cart;

    const lineItemsToAdd = [];

    try {
      cart = await IINShopifyClient.checkout.fetch(cartCookie);

      bundleProducts.forEach((bundleProduct) => {
        let matchedVariant;

        bundleProduct.variants?.forEach((variant) => {
          if (!variant.available) {
            return;
          }

          let isMatch = true;

          // TODO: does this for loop make sense/
          let options = [];

          if (Array.isArray(variant.selectedOptions)) {
            options = variant.selectedOptions;
          }

          options.forEach(({ name, value }) => {
            const userSelectedOption = bundleProduct.userSelectedOptions[name];

            if (userSelectedOption !== value) {
              isMatch = false;
            }
          });

          if (isMatch) {
            matchedVariant = variant;
          }
        });

        if (!matchedVariant) {
          return;
        }

        const existingLineItem = cart.lineItems.find(
          (lineItem) => lineItem.variant.product.id === bundleProduct.id
        );

        if (existingLineItem) {
          return;
        }

        lineItemsToAdd.push({
          variantId: matchedVariant.id,
          quantity: 1,
        });
      });
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

      const backgroundURL = checkout.lineItems[0].variant.image.src;
      const backgroundStyle = { background: `url('${backgroundURL}')` };

      let optionsHTML = '';

      Object.entries(courses).forEach(([, value]) => {
        const courseName = value.course_name;

        if (courseName) {
          optionsHTML += `<div><strong>${courseName}</strong></div>`;
        }
      });

      $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
      $('.jd-add-pop .jd-add-pop-img > div').css(backgroundStyle);
      $('.jd-add-pop .jd-add-pop-name').text(bundleName);
      $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);
      $('.jd-add-pop .jd-add-pop-price').text(`$${priceString}`);
      $('.jd-add-pop').css('top', `${$('.jd-header-wrap').outerHeight()}px`);
      $('.jd-add-pop').addClass('jd-add-pop-show');
      $('.jd-blackout').addClass('jd-blackout-show');

      setTimeout(() => {
        $('.jd-add-pop').removeClass('jd-add-pop-show');
        $('.jd-blackout').removeClass('jd-blackout-show');
      }, msToCloseAddPopUp);
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

      const variant = product.variants.find(({ available }) => {
        if (available) {
          return true;
        }

        return false;
      });

      if (!variant) {
        return lineItem;
      }

      if (variant.id) {
        lineItem = {
          variantId: variant.id,
          quantity: 1,
        };
      }

      const amount = parseInt(variant.price?.amount);

      if (!amount && amount !== 0) {
        return lineItem;
      }

      const formattedAmount = `$${amount.toLocaleString()}`;

      // TODO: move this side effect
      $(`.bp-${productID} .bp-price`).text(formattedAmount);
    } catch (e) {
      console.error(e);
    }

    return lineItem;
  };

  const getLineItemsToAdd = async (courses) => {
    const promises = [];

    courses.forEach((course) => {
      const productID = course.product_id;
      const promise = getLineItem(productID);

      promises.push(promise);
    });

    const responses = await Promise.all(promises);
    const lineItemsToAdd = [];

    responses.forEach((response) => {
      if (response) {
        lineItemsToAdd.push(response);
      }
    });

    return lineItemsToAdd;
  };

  const setBundles = (checkout) => {
    const lineItems = checkout?.lineItems || [];

    if (!Array.isArray(lineItems)) {
      return;
    }

    lineItems.forEach((lineItem) => {
      const productID = lineItem?.variant?.product?.id;

      if (productID) {
        addBundleProduct(productID);
      }
    });
  };

  const setPrice = (checkout) => {
    const applications = checkout?.discountApplications;
    const discounts = Array.isArray(applications) ? applications : [];
    const totalAfterDiscount = parseFloat(checkout.totalPrice?.amount);
    let total = totalAfterDiscount > -1 ? totalAfterDiscount : 0;

    discounts.forEach(({ value }) => {
      const amount = parseFloat(value?.amount) || 0;

      total += amount;
    });

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
  };

  const createCheckout = async (courseData) => {
    const checkout = await IINShopifyClient.checkout.create();

    if (!courseData) {
      console.error('Course data was not provided.');
      return;
    }

    const courses = [];

    Object.values(courseData).forEach((value) => {
      if (value) {
        courses.push(value);
      }
    });

    const lineItemsToAdd = await getLineItemsToAdd(courses);

    if (Array.isArray(lineItemsToAdd) && lineItemsToAdd.length) {
      await IINShopifyClient.checkout.addLineItems(checkout.id, lineItemsToAdd);
    }

    const updatedCheckout = await IINShopifyClient.checkout.fetch(checkout.id);

    setPrice(updatedCheckout);
    setBundles(updatedCheckout);
  };

  createCheckout(moduleData.courses);

  $(`#${moduleData.name} .bp-add-cart`).click(() => {
    const { bundleName, courses } = moduleData;

    addToCart(bundleName, courses);
  });
})();
