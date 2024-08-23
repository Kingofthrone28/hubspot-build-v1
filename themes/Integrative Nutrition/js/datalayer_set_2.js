window.dataLayer = window.dataLayer || [];

/* function ctaClicks(element){
  let position;
  const tracking_id = element.getAttribute('data-tracking-id');
  if (tracking_id.includes('header')){
    position = 'header';
  } else if (tracking_id.includes('body')) {
    position = 'body';
  } else if (tracking_id.includes('footer')) {
    position = 'footer';
  }
  const clickUrl = element.href? element.href.split('?')[0] : 'NA';
  const clickText = element.innerText;
  window.dataLayer.push({
    'event': 'cta_click',
    'click_text': clickText,
    'click_url': clickUrl,
    'position': position
  });
}
const ctas = document.querySelectorAll('[data-tracking-id]');
if (ctas){
  ctas.forEach(function(cta) {
    cta.addEventListener('click',function() {
      ctaClicks(cta);
    });
  });
} */

function contactPop(element, position) {
  let event = 'contact_click';
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
  } else if (clickText.includes('appointment')) {
    event = 'cta_click';
  }
  window.dataLayer.push({
    event,
    click_text: clickText,
    click_url: clickUrl,
    position,
  });
}
const header_contact = document.querySelectorAll('div.jd-contact-pop a');
header_contact.forEach((link) => {
  link.addEventListener('click', () => {
    contactPop(link, 'header');
  });
});
const contact = document.querySelector('#jd-contact');
if (contact) {
  contact.addEventListener('click', () => {
    contactPop(contact, 'header');
  });
}
const entity_body_contact = document.querySelectorAll(
  'div.entity-paragraphs-item span[style] a',
);
entity_body_contact.forEach((link) => {
  link.addEventListener('click', () => {
    contactPop(link, 'body');
  });
});
const course_catalog_body_contact = document.querySelectorAll(
  'span[style="color: #2d3841;"] a',
);
course_catalog_body_contact.forEach((link) => {
  link.addEventListener('click', () => {
    contactPop(link, 'body');
  });
});
const body_contact_click = document.querySelectorAll('div.schedule-text a');
if (body_contact_click) {
  body_contact_click.forEach((link) => {
    link.addEventListener('click', () => {
      contactPop(link, 'body');
    });
  });
}
const footer_contact = document.querySelectorAll(
  'div.footer-main a[href^="tel"]',
);
footer_contact.forEach((link) => {
  link.addEventListener('click', () => {
    contactPop(link, 'footer');
  });
});
const bottom_float_bar = document.querySelector('div.bottom-float-bar a');
if (bottom_float_bar) {
  bottom_float_bar.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'contact_click',
      click_text: 'admission number',
      position: 'footer',
    });
  });
}
function registerWebinar(element) {
  const headerText = element.getAttribute('data-tracking-header-label');
  const clickText = element.querySelector('a').innerText;
  window.dataLayer.push({
    event: 'register_webinar_click',
    header_text: headerText,
    click_text: clickText,
  });
}
const webinars = document.querySelectorAll('div.item-inner.box');
if (webinars) {
  webinars.forEach((webinar) => {
    webinar.addEventListener('click', () => {
      registerWebinar(webinar);
    });
  });
}
// Promotion Clicks
const promo = document.querySelector('a.deal-bar-btn');
if (promo) {
  promo.addEventListener('click', () => {
    const clickText =
      promo.previousElementSibling.previousElementSibling.innerText;
    const promoCode =
      promo.previousElementSibling.getAttribute('data-promo-code');
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
    element.href === `${window.location.href  }#` ||
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
