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

  function getValidVariant(productData) {
    let validVariant;

    for (const variant of productData.variants) {
      if (variant.available) {
        let isMatch = true;

        variant.selectedOptions?.forEach(({ name, value }) => {
          if (selectedOptions[name] !== value) {
            isMatch = false;
          }
        });

        if (isMatch) {
          validVariant = variant;
        }
      }
    }

    return validVariant;
  }

  // Update selectedOptions and show/hide buttons when an attribute is changed
  function checkSelectedOptions(changedAttribute) {
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

            if (selectedOption.value === selectedOptions[changedAttribute]) {
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

    Object.entries(options).forEach(([key, value]) => {
      if (!value.includes(selectedOptions[key])) {
        [selectedOptions[key]] = value;
      }
    });

    // TODO: remove
    console.log('OPTIONS');
    console.log(options);

    // TODO: remove
    console.log('SELECTED OPTIONS');
    console.log(selectedOptions);

    // Original buttons
    /*
    let html = '';

    // Not showing options if there is only 1 default field
    if (options[optionKeys[0]][0] !== 'Default Title') {
      for (const optionKey of optionKeys) {
        html += `<div class="jd-buy-option-label">${optionKey}</div>`;
        html += '<div class="jd-shopify-option-wrap">';

        for (let i = 0; i < options[optionKey].length; i++) {
          const val = options[optionKey][i];

          html += `
            <div
              data-shopify-option-val="${val}"
              data-shopify-option-type="${optionKey}"
              class="jd-shopify-option jd-request-btn hs-button jd-gray-btn${val === selectedOptions[optionKey] ? ' jd-shopify-option-selected' : ''}"
            >
              ${val}
            </div>
          `;
        }

        html += '</div>';
      }
    }

    html += `
      <button
        class="jd-shopify-add-btn jd-request-btn hs-button light-button"
        type="button"
      >
        Add to Cart
      </button>
    `;
    */

    // Checkboxes
    let html = '<div class="jd-shopify-options">';

    // Not showing options if there is only 1 default field
    if (options[optionKeys[0]][0] !== 'Default Title') {
      for (const optionKey of optionKeys) {
        html += `
          <div>
            <div class="jd-buy-option-label">${optionKey}</div>
            <div class="jd-shopify-option-wrap">
        `;

        const values = options[optionKey];

        for (const value of values) {
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
        }

        html += '</div></div>';
      }
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

    // Option click button
    /*
    $(`#${moduleData.name} .jd-shopify-option`).click(function() {
      if ($(this).hasClass('jd-shopify-option-selected')) {
        return;
      }

      const type = $(this).data('shopify-option-type');
      const val = $(this).data('shopify-option-val');

      selectedOptions[type] = val;
      checkSelectedOptions(type);
    });
    */

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

    const addToCart = async (productData) => {
      // TODO: remove
      console.log({ productData });

      const variant = getValidVariant(productData);

      if (!variant) {
        alert('This combination of options is invalid');
      } else {
        let alreadyInCart = false;

        const cartCookie = getCookie('shopifyCart');
        const checkout = await IINShopifyClient.checkout.fetch(cartCookie);

        for (const lineItem of checkout.lineItems) {
          if (lineItem.variant.product.id === productData.id) {
            alreadyInCart = true;
            break;
          }
        }

        if (alreadyInCart) {
          $(`#${moduleData.name} .jd-shopify-add-exists-msg`).show();
          return;
        }

        $(`#${moduleData.name} .jd-shopify-add-exists-msg`).hide();

        const lineItemsToAdd = [
          {
            variantId: variant.id,
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
            `background: url(${variant.image.src})`
          );

          let optionsHTML = '';

          Object.entries(selectedOptions).forEach(([key, value]) => {
            if (value) {
              optionsHTML += `<div><strong>${key}:</strong> ${value}</div>`;
            }
          });

          $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);
          $('.jd-add-pop .jd-add-pop-price').text(
            `$${parseFloat(variant.price.amount).toLocaleString()}`
          );
          $('.jd-add-pop').css(
            'top',
            `${$('.jd-header-wrap').outerHeight()}px`
          );
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

    // Add to cart click
    $(`#${moduleData.name} .jd-shopify-add-btn`).click(function () {
      addToCart(product);
    });
  }

  async function getProductData() {
    try {
      const gidPath = `gid://shopify/Product/${moduleData.productID}`;

      product = await IINShopifyClient.product.fetch(gidPath);

      let initialOptionToCheck;

      for (const variant of product.variants) {
        if (variant.available) {
          for (const { name, value } of variant.selectedOptions) {
            if (!initialOptionToCheck) {
              initialOptionToCheck = name;
              selectedOptions[name] = value;
            }

            // Keeping keys in array to preserve order
            optionKeys.push(name);
          }

          break;
        }
      }

      checkSelectedOptions(initialOptionToCheck);
    } catch (e) {
      console.error(e);
    }
  }

  getProductData();
})();
