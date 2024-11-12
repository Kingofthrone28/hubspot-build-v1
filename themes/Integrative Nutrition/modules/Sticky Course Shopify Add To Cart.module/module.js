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

    const query = IIN.shopify.getHCTPQuery(productID);
    const result = await IINShopifyClient.graphQLClient.send(query);
    const gql = result?.model?.products?.[0];

    if (!gql) {
      console.error(`Failed to find product for id: ${productID}`)
      return;
    }

    IIN.shopify.updateHCTPForV1(gql)
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

    // https://github.com/Shopify/storefront-api-learning-kit?tab=readme-ov-file#metafields-metaobjects
    const metaQ = IINShopifyClient.graphQLClient.query((root) =>
      root.addConnection('metaobjects',
        {
          args: {
            type: 'hctp_data',
            first: 1,
            sortKey: 'updatedAt',
            reverse: true,
          }
        },
        (objects) => {
          objects.add('id')
          objects.add('handle')
          objects.add('fields', (fields) => {
            fields.add('key')
            fields.add('value')
          })
        }
      )
    );
    console.log('meta q', metaQ)
    const moResult = await IINShopifyClient.graphQLClient.send(metaQ);
    console.log('mo result', moResult)
    const obj = moResult?.model?.metaobjects?.[0]
    console.log('mo', obj)
  } catch (error) {
    console.error(error);
  }
})();
