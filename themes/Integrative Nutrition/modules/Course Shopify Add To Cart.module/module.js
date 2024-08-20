(function () {
  let moduleData = {};

  try {
    const rawData = IIN.shopify.getAddToCartSessionData();
    moduleData = JSON.parse(rawData);
  } catch (e) {
    console.error(e);
    return;
  }

  const msToCloseAddPopUp = 8000;
  const optionKeys = [];
  const selectedOptions = {};
  let product;

  /**
   * Returns the selected variant or null if one is not found.
   * @param {string} productData
   * @param {Object|null} productData
   */
  const getSelectedVariant = (productData) => {
    const selectedVariant = productData.variants.find((variant) => {
      const variantOptions = variant?.selectedOptions || [];

      if (
        !variant?.available ||
        !Array.isArray(variantOptions) ||
        !variantOptions.length
      ) {
        return false;
      }

      let isMatch = true;

      variantOptions?.forEach(({ name, value }) => {
        const selectedValue = selectedOptions[name];

        if (selectedValue !== value) {
          isMatch = false;
        }
      });

      return isMatch;
    });

    return selectedVariant || null;
  };

  /**
   * Return a list of possible variants given a selection of options.
   */
  const getPossibleVariants = (variants, selection) =>
    variants.filter((variant) => {
      if (!variant.available) {
        return false;
      }

      return !variant.selectedOptions.some((variantOption) => (
          selection[variantOption.name] !== undefined &&
          selection[variantOption.name] !== variantOption.value
        ));
    });

  /**
   * Returns a Set of possible values given a list of variants and an option key.
   */
  const getPossibleValues = (variants, optionName) => {
    const possibleValues = new Set();
    variants.forEach((variant) => {
      variant.selectedOptions.forEach((variantOption) => {
        if (variantOption.name === optionName) {
          possibleValues.add(variantOption.value);
        }
      });
    });
    return possibleValues;
  };

  /**
   * Return an options object given the current selection, a list of option names,
   * and a list of variants.
   */
  const getOptions = (selection, optionNames, variants) => {
    const options = {};
    const newSelection = {};
    let filteredVariants = getPossibleVariants(variants, newSelection);

    // Iterate through option names
    optionNames.forEach((optionName) => {
      // Get all possible values for each name from a list of variants
      options[optionName] = getPossibleValues(filteredVariants, optionName);

      // If currently selected value is no longer possible
      // set the new selection to a default (first value).
      if (!options[optionName].has(selection[optionName])) {
        newSelection[optionName] = [...options[optionName]][0];
      } else {
        newSelection[optionName] = selection[optionName];
      }

      // Filter the list of variants to match the current selection.
      filteredVariants = getPossibleVariants(filteredVariants, newSelection);
    });

    return { options, newSelection };
  };

  /**
   * Updates selectedOptions and show/hide buttons when an attribute is changed.
   */
  const checkSelectedOptions = () => {
    const variants = Array.isArray(product?.variants) ? product.variants : [];
    const { options, newSelection } = getOptions(
      selectedOptions,
      optionKeys,
      variants,
    );
    optionKeys.forEach((optionKey) => {
      selectedOptions[optionKey] = newSelection[optionKey];
    });

    // Checkboxes
    let html = '<div class="jd-shopify-options">';

    const firstVariantTitle = [...options[optionKeys[0]]]?.[0];

    // Not showing options if there is only 1 default field
    if (firstVariantTitle !== 'Default Title') {
      optionKeys.forEach((optionKey) => {
        html += `
          <div>
            <div class="jd-buy-option-label">
              ${optionKey}
            </div>
            <div class="jd-shopify-option-wrap">
        `;

        const values = options[optionKey] || [];

        values.forEach((value) => {
          html += `
            <div>
              <input
                id="${optionKey}_${value}"
                value="${value}"
                name="${optionKey}"
                ${value === selectedOptions[optionKey] ? 'checked="true"' : ''}
                type="radio"
              />
              <label for="${optionKey}_${value}">${value}</label>
            </div>
          `;
        });

        html += '</div></div>';
      });
    }

    html += `
      </div>
      <button
        class="jd-shopify-add-btn jd-request-btn hs-button light-button"
        type="button"
      >
        Add to Cart
      </button>
      <div style="display: none" class="jd-shopify-add-exists-msg">
        This course is already in your cart
      </div>
    `;

    $(`#${moduleData.name}`).html(html);

    // Option click checkbox
    $(`#${moduleData.name} .jd-shopify-option-wrap input[type=radio]`).change(
      function () {
        const type = $(this).attr('name');
        const val = $(this).val();

        selectedOptions[type] = val;
        checkSelectedOptions();

        const $checkedInputs = $(
          `#${moduleData.name} .jd-shopify-option-wrap input[name="${type}"]:checked`,
        );

        $checkedInputs.first().focus();
      },
    );

    /**
     * Adds a product to the cart.
     * @param {Object} productData
     * @returns {Promise<void>}
     */
    const addToCart = async (productData) => {
      const selectedVariant = getSelectedVariant(productData);

      if (!selectedVariant) {
        // TODO: replace "alert" with alternative UX choice, pop-up, or message.
        alert('This combination of options is invalid');
      } else {
        const cartCookie = IIN.shopify.getCheckoutCookie();
        const checkout = await IINShopifyClient.checkout.fetch(cartCookie);
        const alreadyInCart = IIN.shopify.isProductInCheckout(
          checkout,
          productData.id,
        );

        if (alreadyInCart) {
          $(`#${moduleData.name} .jd-shopify-add-exists-msg`).show();
          return null;
        }

        $(`#${moduleData.name} .jd-shopify-add-exists-msg`).hide();

        const newLineItem = IIN.shopify.createCheckoutLineItem(
          selectedVariant.id,
        );
        const lineItemsToAdd = [newLineItem];

        try {
          const updatedCheckout = await IINShopifyClient.checkout.addLineItems(
            cartCookie,
            lineItemsToAdd,
          );

          updateCartTotal(updatedCheckout);

          $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
          $('.jd-blackout').addClass('jd-blackout-show');
          $('.jd-add-pop .jd-add-pop-cat').text(`${moduleData.category}`);
          $('.jd-add-pop .jd-add-pop-name').text(`${moduleData.courseName}`);
          $('.jd-add-pop .jd-add-pop-img > div').attr(
            'style',
            `background: url(${selectedVariant.image.src})`,
          );

          let optionsHTML = '';

          Object.entries(selectedOptions).forEach(([key, value]) => {
            if (value) {
              optionsHTML += `<div><strong>${key}:</strong> ${value}</div>`;
            }
          });

          $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);

          const amount = parseFloat(selectedVariant.price?.amount) || 0;

          if (amount || amount === 0) {
            $('.jd-add-pop .jd-add-pop-price').text(
              `$${amount.toLocaleString()}`,
            );
          }

          const headerHeight = $('.jd-header-wrap').outerHeight();

          $('.jd-add-pop').css('top', `${headerHeight}px`);
          $('.jd-add-pop').addClass('jd-add-pop-show');

          setTimeout(() => {
            $('.jd-blackout').removeClass('jd-blackout-show');
            $('.jd-add-pop').removeClass('jd-add-pop-show');
          }, msToCloseAddPopUp);

          return selectedVariant;
        } catch (e) {
          console.error(e);
        }
      }
      return null;
    };

    const trackAddToCart = (addedVariant) => {
      const currencyCode = addedVariant.price?.currencyCode || 'USD';
      const addedVariantPrice = parseFloat(addedVariant.price?.amount || 0.0);
      const varientGidPath = 'gid://shopify/ProductVariant/';

      let couponTitle = 'NA';
      let discountAmount = 0;

      if (
        Array.isArray(addedVariant.discountAllocations) &&
        addedVariant.discountAllocations.length
      ) {
        addedVariant.discountAllocations.forEach((discountAllocation) => {
          couponTitle = discountAllocation?.discountApplication?.title;
          discountAmount = discountAllocation?.allocatedAmount?.amount;
        });
      }

      const addItemtoCart = {
        event: 'add_to_cart',
        ecommerce: {
          currency: currencyCode,
          value: addedVariantPrice,
          product_type: 'Individual',
          coupon: couponTitle,
          items: [
            {
              item_id: moduleData.productID,
              item_name: product.title,
              item_type: product.productType,
              variant_id: addedVariant.id.replace(varientGidPath, ''),
              price: addedVariantPrice,
              discount: discountAmount,
              quantity: 1,
              sku: addedVariant.sku || 'NA',
            },
          ],
        },
      };
      // Trigger Add to cart tracking event
      triggerECommEvent(addItemtoCart);
    };
    // Add to cart button click.
    $(`#${moduleData.name} .jd-shopify-add-btn`).click(() => {
      addToCart(product).then((addedVariant) => {
        if (addedVariant) {
          trackAddToCart(addedVariant);
        }
      });
    });
  };

  /**
   * Gets data for a product from Shopify.
   * @returns {Promise<void>}
   */
  const getProductData = async () => {
    try {
      const gidPath = IIN.shopify.buildGlobalProductId(moduleData.productID);

      product = await IINShopifyClient.product.fetch(gidPath);

      const variant = IIN.shopify.getFirstAvailableVariant(product);
      const options = variant?.selectedOptions;

      if (Array.isArray(options) && options.length) {
        options.forEach(({ name, value }) => {
          // Keeping keys in an array to preserve order.
          optionKeys.push(name);
          selectedOptions[name] = value;
        });
      }

      checkSelectedOptions();
    } catch (e) {
      console.error(e);
    }
  };

  getProductData();
})();
