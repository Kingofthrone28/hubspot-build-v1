window.dataLayer = window.dataLayer || [];

/* function ctaClicks(element){
  let position;
  const trackingId = element.getAttribute('data-tracking-id');
  if (trackingId.includes('header')){
    position = 'header';
  } else if (trackingId.includes('body')) {
    position = 'body';
  } else if (trackingId.includes('footer')) {
    position = 'footer';
  }
  const clickUrl = element.href ? element.href.split('?')[0] : 'NA';
  const clickText = element.innerText;
  window.dataLayer.push({
    event: 'cta_click',
    click_text: clickText,
    click_url: clickUrl,
    position,
  });
}
const ctas = document.querySelectorAll('[data-tracking-id]');
ctas.forEach((cta) => {
  cta.addEventListener('click', () => {
    ctaClicks(cta);
  });
}); */

function trackContactClicks(element, position) {
  let clickText = element.innerText;
  let clickUrl = element.href.includes('?')
    ? element.href.split('?')[0]
    : element.href;
  if (
    clickText.includes('(877) 730-5444') ||
    clickText.includes('(513) 776-0961')
  ) {
    clickText = 'us number';
    clickUrl = 'us number';
  } else if (
    clickText.includes('+1 (513) 776-0960') ||
    clickText.includes('+1 (212) 730-5433')
  ) {
    clickText = 'international number';
    clickUrl = 'international number';
  } else if (clickText.includes('Contact')) {
    clickText = 'contact';
    clickUrl = 'contact';
  } else if (clickText.includes('Whatsapp')) {
    clickText = 'whatsapp number';
  } else if (clickText.includes('LIVE Chat Now')) {
    clickText = 'live chat';
  }
  window.dataLayer.push({
    event: 'contact_click',
    click_text: clickText,
    click_url: clickUrl,
    position,
  });
}
const headerContactPopElements = document.querySelectorAll(
  'div.jd-contact-pop a',
);
headerContactPopElements.forEach((headerContactPopElement) => {
  headerContactPopElement.addEventListener('click', () => {
    trackContactClicks(headerContactPopElement, 'header');
  });
});
const headerContactElement = document.querySelector('#jd-contact');
if (headerContactElement) {
  headerContactElement.addEventListener('click', () => {
    trackContactClicks(headerContactElement, 'header');
  });
}
const footerContactElements = document.querySelectorAll(
  'div.footer-main a[href^="tel"]',
);
footerContactElements.forEach((footerContactElement) => {
  footerContactElement.addEventListener('click', () => {
    trackContactClicks(footerContactElement, 'footer');
  });
});
const bottomFloatBar = document.querySelector('div.bottom-float-bar a');
bottomFloatBar?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'contact_click',
    click_text: 'admission number',
    position: 'footer',
  });
});
function trackRegisterWebinar(element) {
  window.dataLayer.push({
    event: 'register_webinar_click',
    header_text: element.getAttribute('data-tracking-header-label'),
    click_text: element.querySelector('div.content a[href]')?.innerText,
  });
}
const webinarElements = document.querySelectorAll('div.item-inner.box');
webinarElements.forEach((webinarElement) => {
  webinarElement.addEventListener('click', () => {
    trackRegisterWebinar(webinarElement);
  });
});
// Promotion Clicks
const promo = document.querySelector('.deal-bar-btn');
if (promo) {
  promo.addEventListener('click', () => {
    const clickText =
      promo.parentElement.children[0].innerText;
    const promoCode =
      promo.parentElement.children[1].getAttribute('data-promo-code');
    window.dataLayer.push({
      event: 'promotion_click',
      click_text: clickText,
      promo_code: promoCode,
    });
    console.log(
      'dataLayer Event:',
      'promotion_click',
      ',',
      'Click Text:',
      clickText,
      ',',
      'Promo Code:',
      promoCode,
    );
  });
}
// Link Clicks
function trackLinkClicks(element) {
  let clickText = element.innerText.trim();
  let clickUrl = element.href ? element.href.split('?')[0] : 'NA';
  if (element.href.includes('facebook')) {
    clickText = 'Facebook';
  } else if (element.href.includes('instagram')) {
    clickText = 'Instagram';
  } else if (element.href.includes('linkedin')) {
    clickText = 'Linkedin';
  } else if (element.href.includes('youtube')) {
    clickText = 'YouTube';
  } else if (element.href === 'https://www.integrativenutrition.com/') {
    clickText = 'logo';
  } else if (
    element.href === `${window.location.href}#` ||
    element.href === 'javascript:void(0);'
  ) {
    clickUrl = 'NA';
  } else if (
    element.href === 'tel:877-730-5444' ||
    element.href === 'tel:1-513-776-0961' ||
    element.href === 'tel:8777305444'
  ) {
    clickText = 'us number';
    clickUrl = 'us number';
  } else if (
    element.href === 'tel:1-513-776-0960' ||
    element.href === 'tel:1-212-730-5433' ||
    element.href === 'tel:15137760960'
  ) {
    clickText = 'international number';
    clickUrl = 'international number';
  } else if (element.className === 'course-card course-card-slim') {
    clickText = element.querySelector('div.course-card-title').innerText.trim();
  } else if (element.className === 'float-icon') {
    clickText = element.parentElement.innerText.trim();
  }
  window.dataLayer.push({
    event: 'link_click',
    click_text: clickText,
    click_url: clickUrl,
  });
}
const linkElements = document.querySelectorAll('a');
linkElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackLinkClicks(element);
  });
});
