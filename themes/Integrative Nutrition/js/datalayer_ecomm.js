window.dataLayer = window.dataLayer || [];

const triggerECommEvent = async (rawPayload = {}) => {
  if (rawPayload && rawPayload.event) {
    window.dataLayer.push({ ecommerce: null }); // As per GTM need-resetting
    window.dataLayer.push(rawPayload);
  }
};

const getCustomItemId = (itemId, variantId) =>
  `shopify_US_${itemId}_${variantId}`;
