(function () {
  let moduleData = {};

  try {
    const rawData = window.sessionStorage.getItem('course_shopify_add_to_cart');

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
   * Updates selectedOptions and show/hide buttons when an attribute is changed.
   * @param {string} changedAttribute
   */
  const checkSelectedOptions = (changedAttribute) => {
    const options = {};
    const variants = Array.isArray(product?.variants) ? product.variants : [];

    variants.forEach((variant) => {
      if (!variant.available) {
        return;
      }

      let variantOptions = [];

      if (Array.isArray(variant.selectedOptions)) {
        variantOptions = variant.selectedOptions;
      }

      // First field all options are available.
      if (!options[optionKeys[0]]) {
        options[optionKeys[0]] = [variantOptions[0].value];
      } else if (!options[optionKeys[0]].includes(variantOptions[0].value)) {
        options[optionKeys[0]].push(variantOptions[0].value);
      }

      if (optionKeys.length < 2) {
        return;
      }

      /*
        Each field after first checks every field before it in order adding
        options for that field if the variant matches the previous selections.
      */
      for (let i = 1; i < optionKeys.length; i++) {
        let isValid = true;

        for (let j = 0; j < i; j++) {
          if (selectedOptions[optionKeys[j]] !== variantOptions[j].value) {
            isValid = false;
          }
        }

        if (isValid) {
          if (!options[optionKeys[i]]) {
            options[optionKeys[i]] = [variantOptions[i].value];
          } else if (
            !options[optionKeys[i]].includes(variantOptions[i].value)
          ) {
            options[optionKeys[i]].push(variantOptions[i].value);
          }
        }
      }
    });

    Object.entries(options).forEach(([key, value]) => {
      if (!value.includes(selectedOptions[key])) {
        [selectedOptions[key]] = value;
      }
    });

    // Checkboxes
    let html = '<div class="jd-shopify-options">';

    const firstVariantTitle = options[optionKeys[0]]?.[0];

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
        checkSelectedOptions(type);
      }
    );

    $(`.jd-shopify-option-wrap input[name="${changedAttribute}"]`)
      .first()
      .focus();

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
        const cartCookie = IIN.cookies.getCookieString('shopifyCart');
        const checkout = await IINShopifyClient.checkout.fetch(cartCookie);

        const alreadyInCart = checkout.lineItems.some(
          ({ variant }) => variant.product.id === productData.id
        );

        if (alreadyInCart) {
          $(`#${moduleData.name} .jd-shopify-add-exists-msg`).show();
          return;
        }

        $(`#${moduleData.name} .jd-shopify-add-exists-msg`).hide();

        const lineItemsToAdd = [
          {
            variantId: selectedVariant.id,
            quantity: 1,
          },
        ];

        try {
          const updatedCheckout = await IINShopifyClient.checkout.addLineItems(
            cartCookie,
            lineItemsToAdd
          );

          updateCartTotal(updatedCheckout);

          $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
          $('.jd-blackout').addClass('jd-blackout-show');
          $('.jd-add-pop .jd-add-pop-cat').text(`${moduleData.category}`);
          $('.jd-add-pop .jd-add-pop-name').text(`${moduleData.courseName}`);
          $('.jd-add-pop .jd-add-pop-img > div').attr(
            'style',
            `background: url(${selectedVariant.image.src})`
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
              `$${amount.toLocaleString()}`
            );
          }

          const headerHeight = $('.jd-header-wrap').outerHeight();

          $('.jd-add-pop').css('top', `${headerHeight}px`);
          $('.jd-add-pop').addClass('jd-add-pop-show');

          setTimeout(() => {
            $('.jd-blackout').removeClass('jd-blackout-show');
            $('.jd-add-pop').removeClass('jd-add-pop-show');
          }, msToCloseAddPopUp);
        } catch (e) {
          console.error(e);
        }
      }
    };

    // Add to cart button click.
    $(`#${moduleData.name} .jd-shopify-add-btn`).click(() => {
      addToCart(product);
    });
  };

  /**
   * Gets data for a product from Shopify.
   * @returns {Promise<void>}
   */
  const getProductData = async () => {
    try {
      const gidPath = `gid://shopify/Product/${moduleData.productID}`;

      product = await IINShopifyClient.product.fetch(gidPath);

      let initialOptionToCheck;

      const variant = product.variants?.find(({ available }) => {
        if (available) {
          return true;
        }

        return false;
      });

      const options = variant?.selectedOptions;

      if (Array.isArray(options) && options.length) {
        options.forEach(({ name, value }) => {
          if (!initialOptionToCheck) {
            initialOptionToCheck = name;
          }

          // Keeping keys in an array to preserve order.
          optionKeys.push(name);
          selectedOptions[name] = value;
        });
      }

      checkSelectedOptions(initialOptionToCheck);
    } catch (e) {
      console.error(e);
    }
  };

  getProductData();
})();
