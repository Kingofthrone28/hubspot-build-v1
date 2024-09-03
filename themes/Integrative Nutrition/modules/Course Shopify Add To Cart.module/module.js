(async () => {
  const {
    getProductData,
    parseMarkupData,
    processProduct,
    handleSelectorChange,
  } = getProductSelectionMethods();

  try {
    const module = parseMarkupData();
    const product = await getProductData(module.productID);
    const { productOptions, variantSelections } = processProduct(product);
    handleSelectorChange(module, product, variantSelections, productOptions);
  } catch (e) {
    console.error(e);
  }
})();
