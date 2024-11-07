(async function () {
  const {
    calculateDiscounts,
    configureAddedToCartPopUp,
    configureDropdownHeading,
    configureHeaderToggle,
    configureImageSlider,
    configureStickyHeaderSampleClass,
    configureStickyNav,
    createViewItemEvent,
    getProductData,
    handleSelectorChangeFull,
    matchPDPBottomSectionToTop,
    parseMarkupData,
    processProduct,
  } = getProductSelectionMethods();

  /** Fix header to the top of the page */
  const makeHeaderFixed = () => {
    document
      .querySelector('.pdp-sticky-wrap')
      .classList.add('pdp-sticky-wrap-fixed');
  };

  try {
    const moduleData = parseMarkupData();
    const {
      isHeaderOnly,
      isInlineAndHeader,
      isSampleClass,
      productID,
      showInlineSection,
      useDynamicHeaderTrigger,
    } = moduleData;

    if (isInlineAndHeader || isHeaderOnly) {
      configureStickyNav();
      configureHeaderToggle(isHeaderOnly, useDynamicHeaderTrigger);
      makeHeaderFixed();
    }

    if (showInlineSection) {
      configureImageSlider();
    }

    if (isSampleClass) {
      configureStickyHeaderSampleClass();
      configureAddedToCartPopUp();
    }

    const metaFieldConfig = [
      'metafields',
      {
        args: {
          identifiers: [
            {
              key: '6_mo_desc',
              namespace: 'custom',
            },
            {
              key: '12_mo_desc',
              namespace: 'custom',
            },
          ],
        },
      },
      (metafield) => {
        metafield.add('key');
        metafield.add('value');
      }
    ];

    const variantConfig = [
      'variants',
      {
        args: {
          first: 10,
        },
      },
      (variant) => {
        variant.add('availableForSale');
        variant.add('title');
        variant.add('priceV2', (price) => {
          price.add('amount');
        });
      },
    ];

    const productConfig = [
      'products',
      {
        args: {
          first: 1,
          query: `id:${productID}`
        }
      },
      (product) => {
        product.add('title');
        product.add('handle');
        product.add(...metaFieldConfig);
        product.addConnection(...variantConfig);
      }
    ];

    const query = IINShopifyClient.graphQLClient.query((root) =>
      root.addConnection(...productConfig)
    );

    const result = await IINShopifyClient.graphQLClient.send(query);
    console.log('result', result);
    const gqlProduct = result?.model?.products?.[0]
    console.log('gqlProduct', gqlProduct)

    const product = await getProductData(productID);
    console.log('product', product)

    const optionsCount = IIN.shopify.getOptionsCount(product);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions, variantSelections } = processProduct(product);
    const availableVariants = IIN.shopify.getAvailableVariants(product);
    const firstVariant = availableVariants?.[0];
    const discountInfo = await calculateDiscounts(firstVariant);

    handleSelectorChangeFull(
      moduleData,
      product,
      variantSelections,
      productOptions,
      discountInfo,
    );

    createViewItemEvent(product, firstVariant, moduleData);
  } catch (error) {
    console.error(error);
  }
})();
