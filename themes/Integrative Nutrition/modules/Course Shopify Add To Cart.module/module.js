(function () {
  var selectedOptions = {};
  let product;
  let optionKeys = [];
  const msToCloseAddPopUp = 5000;
  
  // Update selectedOptions and show/hide buttons when an attribute is changed
  function checkSelectedOptions(changedAttribute) {
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
            if(selectedOption.value == selectedOptions[changedAttribute]) {
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
      if(!options[key].includes(selectedOptions[key])) {
        selectedOptions[key] = options[key][0];
      }
    }
    console.log("OPTIONS");
    console.log(options);
    
    console.log("SELECTED OPTIONS");
    console.log(selectedOptions);
    
    // Original buttons
    /*
    let html = '';
    // Not showing options if there is only 1 default field
    if(options[optionKeys[0]][0] != 'Default Title') {
      for(const o of optionKeys) {
        html += `<div class="jd-buy-option-label">${o}</div>`;
        html += '<div class="jd-shopify-option-wrap">';
        for(let i = 0; i < options[o].length; i++) {
          const val = options[o][i];
          html += `<div data-shopify-option-val="${val}" data-shopify-option-type="${o}" class="${val == selectedOptions[o] ? 'jd-shopify-option-selected' : ''} jd-shopify-option jd-request-btn hs-button jd-gray-btn">${val}</div>`;
        }
        html += '</div>';
      }
    }
    html += '<div class="jd-shopify-add-btn jd-request-btn hs-button light-button">Add to Cart</div>';
    */
    
    // Checkboxes
    let html = '<div class="jd-shopify-options">';
    // Not showing options if there is only 1 default field
    if(options[optionKeys[0]][0] != 'Default Title') {
      for(const o of optionKeys) {
        html += `<div><div class="jd-buy-option-label">${o}</div>`;
        html += '<div class="jd-shopify-option-wrap">';
        for(let i = 0; i < options[o].length; i++) {
          const val = options[o][i];
          html += `<div><input id="${o + '_' + val}" value="${val}" name="${o}" ${val == selectedOptions[o] ? 'checked="true"' : ''} type="radio" />`;
          html += `<label for="${o + '_' + val}">${val}</label></div>`;
        }
        html += '</div></div>';
      }
    }
    html += '</div><div class="jd-shopify-add-btn jd-request-btn hs-button light-button">Add to Cart</div>';
    html += '<div style="display:none" class="jd-shopify-add-exists-msg">This course is already in your cart</div>';

    $('#{{name}}').html(html);
      
      // Option click button
      /*
      $('#{{name}} .jd-shopify-option').click(function() {
        if($(this).hasClass('jd-shopify-option-selected')) {
          return;
        }
        const type = $(this).data('shopify-option-type');
        const val = $(this).data('shopify-option-val');
        selectedOptions[type] = val;
        checkSelectedOptions(type);
      });
      */
      
      // Option click checkbox
      $('#{{name}} .jd-shopify-option-wrap input[type=radio]').change(function() {
        const type = $(this).attr('name');
        const val = $(this).val();
        selectedOptions[type] = val;
        checkSelectedOptions(type);
      });
  
      $(`.jd-shopify-option-wrap input[name="${changedAttribute}"]`).first().focus()
  
      // Add to cart click
      $('#{{name}} .jd-shopify-add-btn').click(async function() {
          let variant;
          for(const v of product.variants) {
            if(v.available) {
              let isMatch = true;
              for(const selectedOption of v.selectedOptions) {
                if(selectedOptions[selectedOption.name] != selectedOption.value) {
                  isMatch = false;
                }
              }
              if(isMatch) {
                variant = v;
              }
            }
          }

          console.log(product);
  
          if(!variant) {
            alert('This combination of options is invalid')
          } else {
            let alreadyInCart = false;
            await IINShopifyClient.checkout.fetch(getCookie('shopifyCart'))
              .then(checkout => {
                for(const lineItem of checkout.lineItems) {
                  if(lineItem.variant.product.id == product.id) {
                    alreadyInCart = true;
                    break;
                  }
                }
              })
            
            if(alreadyInCart) {
              $('#{{name}} .jd-shopify-add-exists-msg').show();
              return;
            }            
            $('#{{name}} .jd-shopify-add-exists-msg').hide();
            
            const lineItemsToAdd = [
              {
                variantId: variant.id,
                quantity: 1
              }
            ];
            IINShopifyClient.checkout.addLineItems(getCookie('shopifyCart'), lineItemsToAdd)
              .then((checkout) => {
                console.log(checkout);
                updateCartTotal(checkout);
                $('.jd-header-wrap').addClass('jd-scrolled').removeClass('ishidden');
                $('.jd-blackout').addClass('jd-blackout-show');
                $('.jd-add-pop .jd-add-pop-cat').text('{{ module.category }}');
                $('.jd-add-pop .jd-add-pop-name').text('{{ module.course_name }}');
                $('.jd-add-pop .jd-add-pop-img > div').attr('style', 'background: url(' + variant.image.src + ')');
                let optionsHTML = '';
                for(const o in selectedOptions) {
                  optionsHTML += `<div><b>${o}:</b> ${selectedOptions[o]}</div>`;
                }
                $('.jd-add-pop .jd-add-pop-options').html(optionsHTML);
                $('.jd-add-pop .jd-add-pop-price').text('$' + parseFloat(variant.price.amount).toLocaleString());

                $('.jd-add-pop').css('top', $('.jd-header-wrap').outerHeight() + 'px')
                 $('.jd-add-pop').addClass('jd-add-pop-show');
                setTimeout(() => {
                  $('.jd-blackout').removeClass('jd-blackout-show');
                  $('.jd-add-pop').removeClass('jd-add-pop-show');
                }, msToCloseAddPopUp);
              })
              .catch(e => {
                console.log(e);
              });
          }
        
      });
  }
  
  IINShopifyClient.product.fetch('gid://shopify/Product/{{ module.product_id }}').then(function(p) {
      product = p;
      const options = {};
      let initialOptionToCheck;
      for(const v of product.variants) {
        if(v.available) {
          for(const selectedOption of v.selectedOptions) {
            if(!initialOptionToCheck) {
              initialOptionToCheck = selectedOption.name;
              selectedOptions[selectedOption.name] = selectedOption.value;
            }
            // Keeping keys in array to preserve order
            optionKeys.push(selectedOption.name);
          }
          break;
        }
      }
        
      checkSelectedOptions(initialOptionToCheck);
    })
    .catch(e => { console.log(e); });
})();