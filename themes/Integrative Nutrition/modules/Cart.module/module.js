(function() {
  let cartData = {}
  
  try {
    const rawData = window.sessionStorage.getItem('cart');

    cartData = JSON.parse(rawData);
  } catch (e) {
    console.log(e);
  }

  const sliderBreakMobile = 850;
  const sliderBreakSmDesk = 1240;
  
  if(window.innerWidth < sliderBreakMobile) {
    $('.jd-checkout-btn-wrap').appendTo('body');
  }
  
  let currentWidth = window.innerWidth;
  $(window).on('resize', function() {
    if(window.innerWidth <= sliderBreakMobile && currentWidth > sliderBreakMobile) {
      $('.jd-checkout-btn-wrap').appendTo('body');
    } else if(window.innerWidth > sliderBreakMobile && currentWidth <= sliderBreakMobile) {
      $('.jd-checkout-btn-wrap').appendTo('.jd-cart-summary-outer');
    }
    if(window.innerWidth <= sliderBreakSmDesk && currentWidth > sliderBreakSmDesk) {
      const rowFluid = $('.jd-cart-rec-outer').parents('.row-fluid').eq(1);
      rowFluid.attr('style', 'width:100% !important;max-width:100% !important');
    } else if(window.innerWidth > sliderBreakSmDesk && currentWidth <= sliderBreakSmDesk) {
      const rowFluid = $('.jd-cart-rec-outer').parents('.row-fluid').eq(1);
      rowFluid.attr('style', '');
    }
    currentWidth = window.innerWidth;
  });
  
  let cohortProducts = [];
  let checkoutURL = '';
  
  $('.jd-cart-enrollment svg').click(function() {
    $('.jd-cart-enrollment').removeClass('jd-cart-enrollment-show');
  });
  // Enrollment form
  $(document).ready(function() {
    let books = '', tuition = '', registration = '', hours = '', weeks = '', fullName = '', firstName = '', lastName = '', email = '', address = '', phone = '', 
        city = '', state = '', zip = '', fullAddress = '', company = '', address2 = '';
    hbspt.forms.create({
      region: "na1",
      portalId: "23273748",
      formId: cartData.formID,
      target: '.jd-cart-enrollment-form-target',
      onFormReady: function() {
        $('.jd-cart-enrollment-form-target input[name=email]').change(function() {
          if($(this).val()) {
            IINShopifyClient.checkout.updateEmail(getCookie('shopifyCart'), $(this).val() )
              .then(checkoutNew => {
                console.log('EMAIL UPDATE');
                console.log(checkoutNew);
                setShopifyCartCookie(checkoutNew, true)
                checkoutURL = checkoutNew.webUrl.replace('the-institute-for-integrative-nutrition.myshopify.com', 'store.integrativenutrition.com');
            })
          }
        })
      },
      onBeforeFormSubmit: function($form, submissionValues) {
        console.log("HERE");
        console.log(submissionValues);
        fullName = '', firstName = '', lastName = '', email = '', address = '', phone = '', 
            city = '', state = '', zip = '', fullAddress = '', company = '', address2 = '';
        for(const field of submissionValues) {
          if(field.name == 'email') {
            email = encodeURIComponent(field.value);
          } else if(field.name == 'firstname') {
            fullName += encodeURIComponent(field.value);
            firstName = encodeURIComponent(field.value);
          } else if(field.name == 'lastname') {
            fullName += encodeURIComponent(' ' + field.value);
            lastName = encodeURIComponent(field.value);
          } else if(field.name == 'phone') {
            phone = encodeURIComponent(field.value);
          } else if(field.name == 'country_region_dropdown') {
            fullAddress += encodeURIComponent(field.value + ', ');
          } else if(field.name == 'city') {
            fullAddress += encodeURIComponent(field.value + ', ');
            city = encodeURIComponent(field.value);
          } else if(field.name == 'us_state') {
            fullAddress += encodeURIComponent(field.value + ', ');
            state = encodeURIComponent(field.value);
          } else if(field.name == 'zip') {
            fullAddress += encodeURIComponent(field.value + ', ');
            zip = encodeURIComponent(field.value);
          } else if(field.name == 'address') {
            fullAddress = encodeURIComponent(field.value + ', ') + fullAddress;
            address = encodeURIComponent(field.value);
          } else if(field.name == 'company') {
            company = encodeURIComponent(field.value);
          } else if(field.name == 'apartment__suite__ect_') {
            address2 = encodeURIComponent(field.value);
          }
        }
        if(fullAddress.length > 6) {
          fullAddress = fullAddress.substring(0, fullAddress.length - 6);
        }
        var future = new Date();
        future.setYear(future.getFullYear() + 1);
        document.cookie = `enrollmentAgreementQuery=&Name=${fullName}&Email=${email}&Address=${fullAddress}&Phone=${phone}; domain=.integrativenutrition.com; expires=${future.toUTCString()};`;
        setEnrollmentLinks();
        const checkoutQuery = `&checkout[email]=${email}&checkout[billing_address][first_name]=${firstName}&checkout[billing_address][last_name]=${lastName}&checkout[billing_address][address1]=${address}&checkout[billing_address][address2]=${address2}&checkout[billing_address][city]=${city}&checkout[billing_address][state]=${state}&checkout[billing_address][zip]=${zip}&&checkout[billing_address][phone]=${phone}&checkout[billing_address][company]=${company}`;
        document.cookie = `checkoutQuery=${checkoutQuery}; domain=.integrativenutrition.com; expires=${future.toUTCString()};`;
      },
      onFormSubmit: function(form) {
        $('.jd-cart-enrollment').removeClass('jd-cart-enrollment-show');
        setTimeout(function() {
          window.open(checkoutURL + getCookie('checkoutQuery'), '_self');
        }, 100);
      }
    });
  });
  
  $('.jd-cart-enrollment').appendTo('body');
  
  $('#jd-checkout-btn').click(function(e) {
    const checkoutQuery = getCookie('checkoutQuery');
    if(cohortProducts.length > 0) {
      if(checkoutQuery) {
        window.open(checkoutURL + checkoutQuery, '_self');
      } else {
        $('.jd-cart-enrollment').addClass('jd-cart-enrollment-show');
      }
    } else {
      if(checkoutQuery) {
        window.open(checkoutURL + checkoutQuery, '_self');
      } else {
        window.open(checkoutURL, '_self');
      }
    }
  });
  
  function initCohortProducts(checkout) {
    cohortProducts = [];
    $('.jd-checkout-btn-wrap').hide();
    
    if(!checkout.lineItems.length) {
      return;
    }
    
    let productQuery = '';
    for(let i = 0; i < checkout.lineItems.length; i++) {
      productQuery += `id:${checkout.lineItems[i].variant.product.id.replace('gid://shopify/Product/', '')}`;
      if(i < checkout.lineItems.length - 1) {
        productQuery += ' OR ';
      }
    }
      
    const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
      root.addConnection('products', { args: { first: 100, query: productQuery } }, (product) => {
        product.add('handle');
        product.add('tags');
        product.add('title');
        product.add(
          'metafields',
          {
            args: {
              identifiers: [
                { key: 'registration_cost', namespace: 'custom' },
                { key: 'tuition', namespace: 'custom' },
                { key: 'books_and_materials', namespace: 'custom' },
                { key: 'number_of_clock_hours', namespace: 'custom' },
                { key: 'number_of_weeks', namespace: 'custom' },
              ],
            },
          },
          (metafield) => {
            metafield.add('key')
            metafield.add('value')
          }
        )    
      })
    });

    IINShopifyClient.graphQLClient.send(productsQuery).then(({model, data}) => {
      for(const product of model.products) {
        for(const tag of product.tags) {
          if(tag.value == 'Cohort') {
            let lineItem;
            for(const item of checkout.lineItems) {
              if(item.variant.product.id == product.id) {
                let total = parseFloat(item.variant.price.amount) * item.quantity;
                if(item.discountAllocations.length) {
                  for(const discount of item.discountAllocations) {
                    total -= parseFloat(discount.allocatedAmount.amount) * item.quantity;
                  }
                }
                product.price = total;
              }
            }
            cohortProducts.push(product);
            break;
          }
        }
      }
      console.log("COHORT PRODUCTS");
      console.log(cohortProducts);
      
      if(cohortProducts.length > 0 && !getCookie('enrollmentAgreementQuery')) {
        $('#jd-checkout-btn').text('Proceed to Enrollment');
      } else {
        $('#jd-checkout-btn').text('Proceed to Checkout');
        setEnrollmentLinks();
      }
      
      $('.jd-checkout-btn-wrap').show();
    })
      .catch(e => {
      console.log(e);
    })
  }
  
  async function productRecommendations(lineItems) {
    $('.jd-cart-rec-outer').hide();
    lineItems.sort((a, b) => {
      let aPrice = parseFloat(a.variant.price.amount);
      let bPrice = parseFloat(b.variant.price.amount);
      if(aPrice > bPrice) {
        return -1;
      } else if(aPrice < bPrice) {
        return 1;
      } else {
        return 0;
      }
    });
    
    const bundleData = cartData?.bundles || [];

    console.log("BUNDLE DATA");
    console.log(bundleData);

    let matchedBundles = [];
    let firstMatchedID = 'NO_MATCH';
    let bundlesFirstItem = 0;
    for(const lineItem of lineItems) {
      for(const bundle of bundleData) {
        const existingBundle = matchedBundles.find(b => {
          return b.name == bundle.name;
        });
        if(existingBundle) {
          continue; 
        }
        if(!bundle.shopify_product_ids) {
          continue;
        }
        const productID = lineItem.variant.product.id.replace('gid://shopify/Product/', '');
        if(bundle.shopify_product_ids.includes(productID)) {
          let hasAllItems = true;
          const bundleIDs = bundle.shopify_product_ids.split(',');
          for(const bundleID of bundleIDs) {
            const existingLineItem = lineItems.find(li => {
              return li.variant.product.id == 'gid://shopify/Product/' + bundleID;
            });
            if(!existingLineItem) {
              hasAllItems = false;
              break;
            }
          }
          if(!hasAllItems) {
            if(firstMatchedID == productID) {
              if(bundlesFirstItem < 2) {
                bundlesFirstItem++;
                matchedBundles.push(bundle);
              }
            } else if(firstMatchedID == 'NO_MATCH') {
              firstMatchedID = productID;
              bundlesFirstItem++;
              matchedBundles.push(bundle);
            } else {
              matchedBundles.push(bundle);
            }
          } else {
            bundle.hasAllItems = true;
          }
        }
        if(matchedBundles.length == 3) {
          break;
        }
      }
      if(matchedBundles.length == 3) {
        break;
      }
    }
    
    console.log("MATCHED BUNDLES1");
    console.log(matchedBundles);
    
    // Add other bundles if less than 3 matches
    if(matchedBundles.length < 3) {
      for(const bundle of bundleData) {
        const existingBundle = matchedBundles.find(b => {
          return b.name == bundle.name;
        });
        if(!existingBundle && !bundle.hasAllItems && !bundle.shopify_product_ids.includes(firstMatchedID)) {
          matchedBundles.push(bundle);
        }
        if(matchedBundles.length == 3) {
          break;
        }
      }
    }
    console.log("MATCHED BUNDLES2");
    console.log(matchedBundles);
    if(matchedBundles.length == 0) {
      return;
    }
    
    const promises = [];
    for(let i = 0; i < matchedBundles.length; i++) {
      const promise = new Promise(async (resolve, reject) => {
        const matchedBundle = matchedBundles[i];
        let bundleProducts = [];
        const bundleIDs = matchedBundle.shopify_product_ids.split(',');
       
        let productQuery = '';
        for(let i = 0; i < bundleIDs.length; i++) {
          productQuery += `id:${bundleIDs[i]}`;
          if(i < bundleIDs.length - 1) {
            productQuery += ' OR ';
          }
        }
        const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
          root.addConnection('products', { args: { first: 100, query: productQuery } }, (product) => {
            product.add('handle');
            product.add('tags');
            product.add('title');
            product.addConnection(
              'images',
              { args: { first: 1 }},
              (image) => {
                image.add('src');
              }
            );
            product.addConnection(
              'variants',
              { args: { first: 100 }},
              (variant) => {
                variant.add('priceV2', (price) => {
                  price.add('amount')
                });
                variant.add('availableForSale');
                variant.add('title');
              }
            );
            product.add(
              'metafields',
              {
                args: {
                  identifiers: [
                    { key: 'program_label', namespace: 'custom' }
                  ],
                },
              },
              (metafield) => {
                metafield.add('key')
                metafield.add('value')
              }
            )    
          })
        });

        await IINShopifyClient.graphQLClient.send(productsQuery).then(({model, data}) => {
          bundleProducts = model.products;
        })
        .catch(e => {
          console.log(e);
        })
        
        if(!bundleProducts || bundleProducts.length == 0) {
          reject();
          return;
        }
        
        console.log("BUNDLE PRODUCTS");
        console.log(bundleProducts);
        let newProducts = [];
        let existingProducts = [];
        let imgListHTML = '';
        let cartItems = [];
        for(let j = 0; j < bundleProducts.length; j++) {
          const product = bundleProducts[j];
          for(const v of product.variants) {
            if(v.availableForSale) {
              cartItems.push({
                variantId: v.id,
                quantity: 1
              })
              break;
            }
          }
        }

        let cart;
        let cartRecPricesHTML = '';
        await IINShopifyClient.checkout.create().then((checkout) => {
          cart = checkout;
        });
        let savings;
        await IINShopifyClient.checkout.addLineItems(cart.id, cartItems);
        await IINShopifyClient.checkout.fetch(cart.id)
        .then(checkout => {
          let totalAfterDiscount = parseFloat(checkout.totalPrice.amount);
          let total = totalAfterDiscount;
          if(checkout.discountApplications && checkout.discountApplications.length) {
            for(const discount of checkout.discountApplications) {
              total += parseFloat(discount.value.amount);
            }
          }
          if(total == totalAfterDiscount) {
            cartRecPricesHTML = `
            <div>Bundle Total price: </div>
            <div></div>
            <div>$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            `;
          } else {
            savings = total - totalAfterDiscount;
            cartRecPricesHTML = `
            <div>Bundle Total price: </div>
            <div>$${total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            <div>$${totalAfterDiscount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
            `;
          }
        })

        for(let j = 0; j < bundleProducts.length; j++) {
          const product = bundleProducts[j];
          const existingLineItem = lineItems.find(li => {
            return li.variant.product.id == product.id;
          });
          if(existingLineItem) {
            existingProducts.push(product);
          } else {
            newProducts.push(product);
          }
        }
        let courseListHTML = '';
        for(let j = 0; j < existingProducts.length; j++) {
          const product = existingProducts[j];
          let price = '';
          for(const v of product.variants) {
            if(v.availableForSale) {
              price = v.priceV2.amount;
              break;
            }
          }
          let topSavings = '';
          if(j == 0 && savings) {
            topSavings = `<div class="jd-cart-rec-save-tag">Save $${savings.toLocaleString()}</div>`;
          }
          let programLabel = '';
          for(const meta of product.metafields) {
            if(!meta) continue;
            if(meta.key == 'program_label') {
              if(meta.value) {
                let img = '<img src="https://course.integrativenutrition.com/hubfs/Course%20Page%20Images/iin_logo.png">';
                if(meta.value.toLowerCase().includes('chopra')) {
                  img = '<img src="https://course.integrativenutrition.com/hubfs/Course%20Page%20Images/chopra_logo.png">';
                }
                programLabel = `<div class="jd-cart-rec-item-program"><div>${img}</div>${meta.value}</div>`;
              }
              break;
            }
          }
          courseListHTML += `
            <div class="jd-cart-rec-item">
              ${topSavings}
              <div class="jd-cart-rec-item-img" style="background:url('${product.images[0].src}');"></div>
              <div class="jd-cart-rec-item-inner" style="${topSavings ? 'padding-top: 30px' : ''}">
                <div>
                  ${programLabel}
                  <div>${product.title}</div>
                </div>
                <div>$${parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
              </div>
            </div>`;
        }
        if(existingProducts.length && newProducts.length) {
          courseListHTML += `<div class="jd-cart-rec-plus"><svg fill="currentColor" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path d="M24 10h-10v-10h-4v10h-10v4h10v10h4v-10h10z"/></svg></div>`;
        }
        for(let j = 0; j < newProducts.length; j++) {
            const product = newProducts[j];
            let price = '';
            for(const v of product.variants) {
              if(v.availableForSale) {
                price = v.priceV2.amount;
                break;
              }
            }
            let topSavings = '';
            if(j == 0 && !existingProducts.length) {
              topSavings = `<div class="jd-cart-rec-save-tag">Save $${savings.toLocaleString()}</div>`;
            }
            let programLabel = '';
            for(const meta of product.metafields) {
              if(!meta) continue;
              if(meta.key == 'program_label') {
                if(meta.value) {
                  let img = '<img src="https://course.integrativenutrition.com/hubfs/Course%20Page%20Images/iin_logo.png">';
                  if(meta.value.toLowerCase().includes('chopra')) {
                    img = '<img src="https://course.integrativenutrition.com/hubfs/Course%20Page%20Images/chopra_logo.png">';
                  }
                  programLabel = `<div class="jd-cart-rec-item-program"><div>${img}</div>${meta.value}</div>`;
                }
                break;
              }
            }
            let optionHTML = '';
            for(let k = 0; k < product.variants.length; k++) {
              const v = product.variants[k];
              if(v.availableForSale) {
                optionHTML += `<option ${k == 0 ? 'selected' : ''} value="${v.id}">${v.title}</option>`;
              }
            }
            courseListHTML += `
            <div class="jd-cart-rec-item">
              ${topSavings}
              <div class="jd-cart-rec-item-img" style="background:url('${product.images[0].src}');"></div>
              <div style="flex:1">
                <div style="${product.variants.length == 1 && product.variants[0].title == 'Default Title' ? '' : 'padding-bottom:10px;'} ${topSavings ? 'padding-top: 30px' : ''}" class="jd-cart-rec-item-inner">
                  <div>
                    ${programLabel}
                    <div>${product.title}</div>
                  </div>
                  <div>$${parseFloat(price).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                </div>
                <div style="${product.variants.length == 1 && product.variants[0].title == 'Default Title' ? 'display:none' : ''}" class="jd-cart-rec-item-inner-2">
                  <div>
                    <select class="jd-cart-rec-select jd-cart-rec-item-to-add">
                      ${optionHTML}
                    </select>
                  </div>
                </div>
              </div>
            </div>`;
        }
        
        let title = `<h3 class="jd-cart-rec-title">${matchedBundle.name}</h3>`;
        if(matchedBundle.page_link) {
          title = `<h3 class="jd-cart-rec-title"><a href="${matchedBundle.page_link}">${matchedBundle.name}</a></h3>`;
        }

        resolve(`<div class="jd-cart-rec-wrap" id="bundle-${i}">
          <div class="jd-cart-rec">
            <div>Save Buying Together</div>
            ${title}
            <div class="jd-cart-rec-list">${courseListHTML}</div>
            <div class="jd-cart-rec-bottom">
              <div class="jd-cart-rec-prices">
                ${cartRecPricesHTML}
              </div>
              <div class="jd-cart-rec-add-wrap">
                <div data-bundle="${i}" class="jd-cart-rec-add jd-request-btn hs-button light-button">Add to cart</div>
                ${ savings ?
                `<div>and save $${savings.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>` : ''}
              </div>
            </div>
          </div>
        </div>`)
      });
      promises.push(promise);
    }
    
    let bundleHTML = '';
    await Promise.all(promises).then(values => {
      values.forEach(html => {
        bundleHTML += html;
      })
    });
    
    try {
      $('.jd-cart-rec-outer').slick('unslick');
    } catch(e) {  }
    $('.jd-cart-rec-outer').html(bundleHTML);

    $('.jd-cart-rec-add').click(function() {
      const cartItems = [];
      $(`#bundle-${$(this).data('bundle')} .jd-cart-rec-item-to-add`).each(function() {
        cartItems.push({
          variantId: $(this).val(),
          quantity: 1
        });
      });
      IINShopifyClient.checkout.addLineItems(getCookie('shopifyCart'), cartItems)
        .then((checkout) => {
        loadCart();
      })
    });
    
    $('.jd-cart-rec-outer').show();
    
    if(window.innerWidth <= sliderBreakSmDesk) {
      const rowFluid = $('.jd-cart-rec-outer').parents('.row-fluid').eq(1);
      rowFluid.attr('style', 'width:100% !important;max-width:100% !important');
    }
    
    $('.jd-cart-rec-outer').slick({
        slidesToShow: 3,
        slidesToScroll: 1,
        dots: false,
        arrows: false,
        responsive: [
          {
            breakpoint: sliderBreakSmDesk,
            settings: {
              slidesToShow: 2,
              centerMode: true,
              centerPadding: '25px',
              slidesToScroll: 1
            }
          },
          {
            breakpoint: sliderBreakMobile,
            settings: {
              slidesToShow: 1,
              centerMode: true,
              centerPadding: '25px',
              slidesToScroll: 1
            }
          }
        ]
    });
  }
  
  loadCart();
  function loadCart(noProductChange) {
    if(!getCookie('shopifyCart')) {
      $('.jd-cart-outer').addClass('jd-cart-empty');
      $('.jd-cart-items').html('');
      return;
    }
    
    IINShopifyClient.checkout.fetch(getCookie('shopifyCart'))
    .then(async checkout => {
      if(!noProductChange) {
        initCohortProducts(checkout);
        checkoutURL = checkout.webUrl.replace('the-institute-for-integrative-nutrition.myshopify.com', 'store.integrativenutrition.com');
        productRecommendations(JSON.parse(JSON.stringify(checkout.lineItems)));
      }
      
      if(checkout.lineItems.length == 0) {
        $('.jd-cart-outer').addClass('jd-cart-empty');
        $('.jd-cart-items').html('');
        return;
      } else {
        $('.jd-cart-outer').removeClass('jd-cart-empty');
      }
      
      // Program label metafield
      let productQuery = '';
      for(let i = 0; i < checkout.lineItems.length; i++) {
        productQuery += `id:${checkout.lineItems[i].variant.product.id.replace('gid://shopify/Product/', '')}`;
        if(i < checkout.lineItems.length - 1) {
          productQuery += ' OR ';
        }
      }
      const productsQuery = IINShopifyClient.graphQLClient.query((root) => {
        root.addConnection('products', { args: { first: 100, query: productQuery } }, (product) => {
          product.add('title');
          product.add(
            'metafields',
            {
              args: {
                identifiers: [
                  { key: 'program_label', namespace: 'custom' }
                ],
              },
            },
            (metafield) => {
              metafield.add('key')
              metafield.add('value')
            }
          )    
        })
      });

      await IINShopifyClient.graphQLClient.send(productsQuery).then(({model, data}) => {
        for(const product of model.products) {
          const lineItem = checkout.lineItems.find(lineItem => {
            return lineItem.variant.product.id == product.id;
          })
          if(lineItem) {
            for(const meta of product.metafields) {
              if(!meta) continue;
              if(meta.key == 'program_label') {
                if(meta.value) {
                  lineItem.programLabel = meta.value;
                }
                break;
              }
            }
          }
        }
      })
      .catch(e => {
        console.log(e);
      })
      
      let itemsHTML = '';
      let itemSummaryHTML = '';
      for(const item of checkout.lineItems){
        let optionsHTML = '';
        for(const o of item.variant.selectedOptions) {
          if(o.value != 'Default Title') {
            optionsHTML += `<div><b>${o.name}:</b> ${o.value}</div>`;
          }
        }
        if(item.quantity > 1) {
          optionsHTML += `<div><b>Quantity:</b> ${item.quantity}</div>`;
        }
        let totalPreDiscount = parseFloat(item.variant.price.amount) * item.quantity;
        let total = totalPreDiscount;
        if(item.discountAllocations.length) {
          for(const discount of item.discountAllocations) {
            total -= parseFloat(discount.allocatedAmount.amount) * item.quantity;
          }
        }
        let itemAmountHTML = '';
        if(total != totalPreDiscount) {
          itemAmountHTML = `
          <div class="jd-cart-item-price-dis">$${totalPreDiscount.toLocaleString()}</div>
          <div class="jd-cart-item-price">$${total.toLocaleString()}</div>
          `;
        } else {
          itemAmountHTML = `
          <div style="margin-top:15px" class="jd-cart-item-price">$${total.toLocaleString()}</div>
          `;
        }
        let programLabel = '';
        if(item.programLabel) {
          programLabel = `<div class="jd-cart-rec-item-program">${item.programLabel.toUpperCase()}</div>`;
        }
        itemsHTML += `
        <div class="jd-cart-item">
          <div class="jd-add-pop-content">
            <div class="jd-add-pop-img"><div style="background: url(${item.variant.image.src})"></div></div>
            <div class="jd-add-pop-content-main">
              ${programLabel}
              <div class="jd-add-pop-name">${item.title}</div>
              <div class="jd-add-pop-options">${optionsHTML}</div>
              <div class="jd-cart-item-btns">
                ${ optionsHTML ?
                `<a data-line="${item.id}" class="jd-cart-item-edit" href="">
                  <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m11.25 6c.398 0 .75.352.75.75 0 .414-.336.75-.75.75-1.505 0-7.75 0-7.75 0v12h17v-8.749c0-.414.336-.75.75-.75s.75.336.75.75v9.249c0 .621-.522 1-1 1h-18c-.48 0-1-.379-1-1v-13c0-.481.38-1 1-1zm1.521 9.689 9.012-9.012c.133-.133.217-.329.217-.532 0-.179-.065-.363-.218-.515l-2.423-2.415c-.143-.143-.333-.215-.522-.215s-.378.072-.523.215l-9.027 8.996c-.442 1.371-1.158 3.586-1.264 3.952-.126.433.198.834.572.834.41 0 .696-.099 4.176-1.308zm-2.258-2.392 1.17 1.171c-.704.232-1.274.418-1.729.566zm.968-1.154 7.356-7.331 1.347 1.342-7.346 7.347z" fill-rule="nonzero"/></svg>
                  Edit
                </a>
                <span>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;</span>` : ''
                }
                <a data-line="${item.id}" class="jd-cart-item-delete" href="">
                  <svg viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd"><path d="M19 24h-14c-1.104 0-2-.896-2-2v-17h-1v-2h6v-1.5c0-.827.673-1.5 1.5-1.5h5c.825 0 1.5.671 1.5 1.5v1.5h6v2h-1v17c0 1.104-.896 2-2 2zm0-19h-14v16.5c0 .276.224.5.5.5h13c.276 0 .5-.224.5-.5v-16.5zm-9 4c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm6 0c0-.552-.448-1-1-1s-1 .448-1 1v9c0 .552.448 1 1 1s1-.448 1-1v-9zm-2-7h-4v1h4v-1z"/></svg>
                  Delete
                </a>
              </div>
              <div></div>
            </div>
          </div>
          <div>
            ${itemAmountHTML}
          </div>
        </div>
        `;
        
        itemSummaryHTML += `<div style="font-size: 20px;">$${total.toLocaleString()}</div>`;
      }
      if(checkout.lineItems.length > 1) {
        itemSummaryHTML += `<div style="font-size: 20px;border-top: 1px solid #ccc; padding-top: 5px">$${parseFloat(checkout.totalPrice.amount).toLocaleString()}</div>`;
      }
      $('.jd-cart-items').html(itemsHTML);
      if(checkout.lineItems.length) {
        $('.jd-cart-summary > div:first-child').html(`Order Summary <i>(${checkout.lineItems.length} items)</i>`);
        $('.jd-cart-summary-items').html(itemSummaryHTML);
        $('.jd-checkout-btn-wrap').show();
      } else {
        $('.jd-cart-summary > div:first-child').html(`Order Summary <i>(0 items)</i>`);
        $('.jd-cart-summary-items').html('');
        $('.jd-checkout-btn-wrap').hide();
      }
      $('.jd-cart-item-delete').click(function(e) {
        e.preventDefault();
        IINShopifyClient.checkout.removeLineItems(getCookie('shopifyCart'), [ $(this).data('line') ]).then((checkout) => {
          loadCart();
          updateCartTotal(checkout);
        });
      });
      $('.jd-cart-item-edit').click(function(e) {
        e.preventDefault();
        console.log(checkout);
        console.log($(this).data('line'));
        const lineID = $(this).data('line');
        let line;
        for(const lineItem of checkout.lineItems) {
          if(lineItem.id == lineID) {
            line = lineItem;
            break;
          }
        }
        if(!line) {
          return;
        }
        IINShopifyClient.product.fetch(line.variant.product.id).then((p) => {
          console.log(p);
          const ts = new Date().getTime();
          let selectHTML = `<select id="${ts}" class="jd-cart-rec-select">`;
          for(let i = 0; i < p.variants.length; i++) {
            const variant = p.variants[i];
            if(variant.available) {
              selectHTML += `<option ${i == 0 ? 'selected' : ''} value="${variant.id}">${variant.title}</option>`;
            }
          }
          selectHTML += `</select>`;
          $(this).parent().next().html(selectHTML);
          $('#' + ts).change(function() {
            const lineItemUpdate = [{
              id: lineID,
              variantId: $(this).val()
            }]
            IINShopifyClient.checkout.updateLineItems(getCookie('shopifyCart'), lineItemUpdate).then((checkout) => {
              loadCart(true);
            });
          });
        })
      });
    })
  }
  
  function setEnrollmentLinks() {
    const cartAttributes = {
      customAttributes: []
    }
    for(const product of cohortProducts) {
      const course = encodeURIComponent(product.title);
      const productID = product.id.replace('gid://shopify/Product/', '');
      const price = encodeURIComponent('$' + product.price.toLocaleString());
      const dateObj = new Date();
      const year = dateObj.getFullYear();
      let month = dateObj.getMonth() + 1;
      if(month < 10) {
        month = '0' + month;
      }
      let d = dateObj.getDate();
      if(d < 10) {
        d = '0' + d;
      }
      const date = `${year}-${month}-${d}`;
      let books = '', tuition = '', registration = '', hours = '', weeks = '';
      for(const metaField of product.metafields) {
        if(!metaField) continue;
        if(metaField.key == 'registration_cost') {
          registration = encodeURIComponent(metaField.value);
        } else if(metaField.key == 'books_and_materials') {
          books = encodeURIComponent(metaField.value);
        } else if(metaField.key == 'number_of_clock_hours') {
          hours = encodeURIComponent(metaField.value);
        } else if(metaField.key == 'number_of_weeks') {
          weeks = encodeURIComponent(metaField.value);
        } else if(metaField.key == 'tuition') {
          tuition = encodeURIComponent(metaField.value);
        }
      }
      cartAttributes.customAttributes.push({
        key: product.title,
        value: `https://course.integrativenutrition.com/enrollment-agreement?Course=${course}&ProductId=${productID}&Books=${books}&Tuition=${tuition}&Registration=${registration}&Date=${date}&Price=${price}&hours=${hours}&weeks=${weeks}${getCookie('enrollmentAgreementQuery')}`
      });
      console.log(cartAttributes.customAttributes);
    }
    IINShopifyClient.checkout.updateAttributes(getCookie('shopifyCart'), cartAttributes).then((checkout) => {
      console.log(checkout);
    });
  }
})();