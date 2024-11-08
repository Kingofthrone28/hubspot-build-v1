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

  const log = console.log;

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
        variant.add('selectedOptions', (option) => {
          option.add('name')
          option.add('value')
        })
        variant.add('priceV2', (price) => {
          price.add('amount');
        });
      },
    ];

    const optionsConfig = [
      'options',
      { args: { first: 10 } },
      (option) => {
        option.add('name')
        option.add('values')
      }
    ];

    const productConfig = [
      'products',
      {
        args: {
          first: 1,
          query: `id:${productID}`
        }
      },
      (products) => {
        products.add('title');
        products.add('handle');
        products.add('availableForSale');
        products.add(...metaFieldConfig);
        products.add(...optionsConfig)
        products.addConnection(...variantConfig);
      }
    ];

    const query = IINShopifyClient.graphQLClient.query((root) =>
      root.addConnection(...productConfig)
    );

    const result = await IINShopifyClient.graphQLClient.send(query);
    const gql = result?.model?.products?.[0]
    gql.variants?.forEach(v => v.available = v.availableForSale)
    log('gqlProduct', gql)

    const optionsCount = IIN.shopify.getOptionsCount(gql);
    configureDropdownHeading(optionsCount);
    matchPDPBottomSectionToTop(optionsCount);
    const { productOptions: gpo, variantSelections: gvs } = processProduct(gql);
    const availableVariants = IIN.shopify.getAvailableVariants(gql);
    const firstVariant = availableVariants?.[0];
    const discountInfo = await calculateDiscounts(firstVariant);

    handleSelectorChangeFull(
      moduleData,
      gql,
      gvs,
      gpo,
      discountInfo,
    );

    createViewItemEvent(gql, firstVariant, moduleData);
  } catch (error) {
    console.error(error);
  }
})();
