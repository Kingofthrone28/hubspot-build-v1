window.dataLayer = window.dataLayer || [];

const triggerECommEvent = async (rawPayload = {}) => {
  if (IIN.cookies.checkCookie('analyticstest')) {
    if (rawPayload && rawPayload.event) {
      window.dataLayer.push({ ecommerce: null }); // As per GTM need-resetting
      window.dataLayer.push(rawPayload);
    }
  }
};
