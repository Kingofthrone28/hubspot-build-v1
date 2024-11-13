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
      name,
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
    const product = result?.model?.products?.[0];

    if (!product) {
      console.error(`Failed to find product for id: ${productID}`)
      return;
    }

    IIN.shopify.updateHCTPForV1(product)
    log('gqlProduct', product)

    const optionIDPairs = product.options.map(({ id, name }) => [name, id])
    const optionNameIDMap = new Map(optionIDPairs)
    console.log('option id map', optionNameIDMap)

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

    const optionsDescriptions = product.metafields?.[3].value;
    const metaObjectIDs = JSON.parse(optionsDescriptions)
    const metaObjectPromises = metaObjectIDs.map(IIN.shopify.getMetaObject)
    const metaObjectResults = await IIN.helpers.allResolved(metaObjectPromises)
    const metaObjects = metaObjectResults.map(value => value?.model.metaobject)

    console.log('metaObjects', metaObjects)

    const optionIDToDescriptionsMap = metaObjects.reduce((map, { fields }) => {
      const combined = Object.fromEntries(fields.map(({ key, value }) => [key, value]))
      const id = combined.option_id;

      if (!map.has(id)) {
        return map.set(id, [combined])
      }

      map.get(id).push(combined)
      return map
    }, new Map())

    console.log('combined', optionIDToDescriptionsMap)

    // match and update
    const moduleElement = document.getElementById(`${name}`)
    console.log('ele', moduleElement)
    const options = moduleElement.getElementsByClassName('jd-buy-option')
    console.log('options', options)
    const forEach = Array.prototype.forEach;

    forEach.call(options, (option) => {
      const optionName = option.firstChild.dataset.optionName;
      const optionID = optionNameIDMap.get(optionName)
      const optionDescriptions = optionIDToDescriptionsMap.get(optionID)
      if (!optionDescriptions) {
        return;
      }

      console.log('optionDescriptions', optionDescriptions)

      const container = document.createElement('div')
      container.classList.add('description-container')
      option.appendChild(container)
      const inputs = option.querySelectorAll('input')

      console.log('inputs', inputs)
      forEach.call(inputs, (input, index) => {
        const isChecked = input.getAttribute('checked')
        if (!isChecked) {
          return;
        }

        const { description } = optionDescriptions[index];
        const paragraph = document.createElement('p')
        const text = document.createTextNode(description)
        paragraph.appendChild(text);
        container.appendChild(paragraph)
      })
    })
  } catch (error) {
    console.error(error);
  }
})();
