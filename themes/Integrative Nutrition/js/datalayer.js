window.dataLayer = window.dataLayer || [];

/**
 * Add an event to the data layer
 * N.B. This does not capture all data layer events
 * @param {*} eventData Event to track
 */
function addDataLayerEvent(eventData) {
  window.dataLayer.push(eventData);
}

function trackAccordionClick(element) {
  addDataLayerEvent({
    event: 'accordion_click',
    click_text: element.firstChild.innerText,
    action: element.classList.contains('active') ? 'close' : 'open',
  });

  element.classList.toggle('active');
}

function trackBioView(element) {
  addDataLayerEvent({
    event: 'accordion_click',
    click_text: element.innerText,
    action: 'open',
  });
}

function trackBioClose(element) {
  addDataLayerEvent({
    event: 'accordion_click',
    click_text: element.innerText,
    action: 'close',
  });
}

function trackSocialShare(element) {
  const blogTitle = element.parentElement.previousElementSibling.innerText;
  let shareType;

  if (element.href.includes('facebook')) {
    shareType = 'facebook';
  } else if (element.href.includes('linkedin')) {
    shareType = 'linkedin';
  } else if (element.href.includes('twitter')) {
    shareType = 'twitter';
  } else if (element.href.includes('pinterest')) {
    shareType = 'pinterest';
  } else if (element.href.includes('mailto')) {
    shareType = 'mail';
  }

  addDataLayerEvent({
    event: 'social_share',
    blog_title: blogTitle,
    share_type: shareType,
  });
}

function trackOpenChat() {
  addDataLayerEvent({
    event: 'chat_click',
    chat_action: 'open',
  });
}

function trackCloseChat() {
  addDataLayerEvent({
    event: 'chat_click',
    chat_action: 'close',
  });
}

function initializeEvents() {
  const accordions = document.querySelectorAll(
    `[data-tracking-element="accordion"]`,
  );

  accordions.forEach((link) => {
    link.addEventListener('click', () => {
      trackAccordionClick(link);
    });
  });

  const viewBioButtons = document.querySelectorAll(
    `[data-tracking-element="team-bio"] .bio-closed strong`,
  );

  viewBioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      trackBioView(button);
    });
  });

  const closeBioButtons = document.querySelectorAll(
    `[data-tracking-element="team-bio"] .bio-open strong`,
  );

  closeBioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      trackBioClose(button);
    });
  });

  const socialShareLogos = document.querySelectorAll(
    `[data-tracking-element="post-share"] a`,
  );

  socialShareLogos.forEach((logo) => {
    logo.addEventListener('click', () => {
      trackSocialShare(logo);
    });
  });

  // Needle chat added via external script
  const openChatButton = document.querySelector('#chatbtn');
  openChatButton?.addEventListener('click', trackOpenChat);

  const inviteDiv = document.querySelector('#inviteBody');
  if (inviteDiv?.children.length > 3) {
    const closeChatBtn = inviteDiv.children[3];

    closeChatBtn?.addEventListener('click', trackCloseChat);
  }
}

window.addEventListener('load', initializeEvents);

/* -----------------START---------------------
Header - Footer - SubNavigation Click Events
----------------------------------------------*/

// Header Navigation Events tracking
const headerNavMenuElements = document.querySelectorAll(
  `[data-tracking-element="main-menu-item"]`,
);

headerNavMenuElements.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'header_nav_click',
      click_text: element.innerText,
      // Sending 0 in case no navigation, only opening sub menu
      click_url: '0',
    });
  });
});

// Navigation Logo tracking
const navLogoElements = document.querySelectorAll(
  `[data-tracking-element="header-logo"]`,
);

navLogoElements.forEach((element) => {
  element.addEventListener('click', (event) => {
    addDataLayerEvent({
      event: 'header_nav_click',
      click_text: 'logo',
      click_url: event.currentTarget.href,
    });
  });
});

// Navigation Top Container tracking (desktop)
// i.e. Español, login, and cart buttons
const topBarNavigationTrackingSelectors = [
  `.jd-header-top.jd-mobile-hide [data-tracking-element="header-link"]`,
  `.jd-header-top.jd-mobile-hide [data-tracking-element="contact-us-trigger"]`,
];

const topBarNavigationElements = document.querySelectorAll(
  topBarNavigationTrackingSelectors,
);

topBarNavigationElements.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'header_nav_click',
      click_text:
        element.parentElement.id === 'jd-cart' ? 'cart' : element.innerText,
      click_url:
        element.href === `${window.location.href}#` ? '0' : element.href,
    });
  });
});

// Mobile main menu dropdown footer links
// i.e. espanol, whatsapp, login
const mobileMainMenuDropdownFooterLinks = document.querySelectorAll(
  `[data-tracking-element="main-menu-mobile-link"]`,
);
mobileMainMenuDropdownFooterLinks.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'header_nav_click',
      click_text: element.innerText,
      click_url: element.href,
    });
  });
});

// Navigation CTA tracking
// TODO: This doesn't seems to capture anything...
// For the future maybe, but doesn't use querySelectorAll...
const navCTAElement = document.querySelector(
  '.jd-header-main.jd-mobile-hide [data-tracking-id]',
);

navCTAElement?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'header_nav_click',
    click_text: navCTAElement.innerText,
    click_url: navCTAElement.href,
  });
});

// Sub Navigation Events tracking
const subNavigationLinkElements = document.querySelectorAll(
  `[data-tracking-element="main-menu-child"]`,
);

subNavigationLinkElements.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'sub_nav_click',
      header_title:
        element.parentElement.parentElement.previousElementSibling.innerText,
      click_text: element.innerText,
      click_url: element.href,
    });
  });
});

// Footer and Link Click tracking
function trackFooterNavigationAndLinkClicks(
  element,
  eventName,
  isFooterNavLink = false,
) {
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
    element.href.startsWith('javascript')
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

  addDataLayerEvent({
    event: eventName,
    click_text: clickText,
    click_url: clickUrl,
  });

  if (
    isFooterNavLink &&
    (clickUrl === 'https://iin.secure.force.com/AS' ||
      clickUrl === 'https://info.integrativenutrition.com/contact-us')
  ) {
    addDataLayerEvent({
      event: 'cta_click',
      click_text: clickText,
      click_url: clickUrl,
      position: 'footer',
    });
  }
}

// DND section, cannot add or target data attributes
const footerNavLinkElements = document.querySelectorAll('.footer-main a');

footerNavLinkElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackFooterNavigationAndLinkClicks(element, 'footer_click', true);
  });
});

/* -----------------END---------------------
Header - Footer - SubNavigation Click Events
----------------------------------------------*/

// Hero Banner Click Events tracking
const heroBannerElements = document.querySelectorAll(
  '[data-tracking-id*="hero"]',
);

heroBannerElements.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'hero_banner_click',
      click_text: element.innerText,
      click_url: element.href ? element.href.split('?')[0] : 'NA',
    });
  });
});

/* -----------------START---------------------
TAB Click Events
----------------------------------------------*/

function trackTabClickEvent(element) {
  addDataLayerEvent({
    event: 'tab_click',
    click_text: element.innerText,
  });
}

const homePageTabElements = document.querySelectorAll(
  `[data-tracking-element="course-tab"]`,
);

homePageTabElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackTabClickEvent(element);
  });
});

const productDetailsPageTabElements = document.querySelectorAll(
  '[data-tracking-id*="tab"]',
);

productDetailsPageTabElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackTabClickEvent(element);
  });
});

const bundleProductDetailPageTabElements = document.querySelectorAll(
  `[data-tracking-element="tabbed-content-tab"]`,
);

bundleProductDetailPageTabElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackTabClickEvent(element);
  });
});

/* -----------------END----------------------
TAB Click Events
----------------------------------------------*/

// Hamburger Click Event tracking
const openHamburgerMenuElement = document.querySelector(
  `[data-tracking-element="mobile-menu-open"]`,
);

openHamburgerMenuElement?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'hamburger_click',
    action: 'open',
  });
});

const closeHamburgerMenuElement = document.querySelector(
  `[data-tracking-element="mobile-menu-close"]`,
);

closeHamburgerMenuElement?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'hamburger_click',
    action: 'close',
  });
});

// Breadcrumbs Click Event tracking
const breadCrumbsElements = document.querySelectorAll(
  `[data-tracking-element="blog-menu"] a`,
);

breadCrumbsElements.forEach((element) => {
  element.addEventListener('click', () => {
    addDataLayerEvent({
      event: 'breadcrumb_click',
      click_text: element.innerText === '' ? 'Home' : element.innerText,
      click_url: element.href,
    });
  });
});

// Generic CTA Clicks Event tracking
function trackGenericCTAClick(element) {
  let position;
  const trackingId = element.getAttribute('data-tracking-id');

  if (trackingId.includes('header')) {
    position = 'header';
  } else if (trackingId.includes('body')) {
    position = 'body';
  } else if (trackingId.includes('footer')) {
    position = 'footer';
  }

  addDataLayerEvent({
    event: 'cta_click',
    click_text: element.innerText,
    click_url: element.href ? element.href.split('?')[0] : 'NA',
    position,
    cta_track_id: trackingId,
  });
}

const allGenericCTAElements = document.querySelectorAll('[data-tracking-id]');

allGenericCTAElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackGenericCTAClick(element);
  });
});

function getSelectedFilters() {
  const selectedTopics = [
    ...document.querySelectorAll(
      `[data-tracking-element="filter-by-topics"] input:checked`,
    ),
  ].map(({ value }) => value);

  const selectedLevels = [
    ...document.querySelectorAll(
      `[data-tracking-element="filter-by-levels"] input:checked`,
    ),
  ].map(({ value }) => value);

  const selectedTypes = [
    ...document.querySelectorAll(
      `[data-tracking-element="filter-by-type"] input:checked`,
    ),
  ].map(({ value }) => value);

  return { selectedTopics, selectedLevels, selectedTypes };
}

function trackFilterEvent() {
  const { selectedTopics, selectedLevels, selectedTypes } =
    getSelectedFilters();

  addDataLayerEvent({
    event: 'filter',
    filter_topics: selectedTopics,
    filter_levels: selectedLevels,
    filter_type: selectedTypes,
  });
}

const saveButtonElement = document.querySelector(
  `[data-tracking-element="filter-save"]`,
);

saveButtonElement?.addEventListener('click', trackFilterEvent);

const linkElements = document.querySelectorAll('a');

linkElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackFooterNavigationAndLinkClicks(element, 'link_click');
  });
});

function trackRegisterWebinar(element) {
  const headerText = element.getAttribute('data-tracking-header-label');
  const clickText = element.querySelector('div.content a')?.innerText;

  addDataLayerEvent({
    event: 'register_webinar_click',
    header_text: headerText,
    click_text: clickText,
  });
}

const webinarElements = document.querySelectorAll('div.item-inner.box');

webinarElements.forEach((webinarElement) => {
  webinarElement.addEventListener('click', () => {
    trackRegisterWebinar(webinarElement);
  });
});

function trackVimeoVideo(videoElement) {
  const vimeoScriptTag = document.createElement('script');

  vimeoScriptTag.src = 'https://player.vimeo.com/api/player.js';
  vimeoScriptTag.onload = function () {
    const player = new Vimeo.Player(videoElement);
    let previousTrackedPercentage = -1;

    player
      .getVideoTitle()
      .then((videoTitle) => {
        player.on('play', () => {
          addDataLayerEvent({
            event: 'video_start',
            video_title: videoTitle,
          });
        });

        player.on('ended', () => {
          addDataLayerEvent({
            event: 'video_complete',
            video_title: videoTitle,
          });
        });

        player.on('timeupdate', (data) => {
          const percentagePlayed = parseInt((data.percent * 100).toFixed(2));

          if (percentagePlayed === previousTrackedPercentage) {
            return;
          }

          previousTrackedPercentage = percentagePlayed;

          switch (percentagePlayed) {
            case 10:
            case 25:
            case 50:
            case 75:
              addDataLayerEvent({
                event: 'video_progress',
                video_title: videoTitle,
                video_percent: percentagePlayed,
              });

              break;
            default:
              break;
          }
        });
      })
      .catch((error) => {
        console.error('Error getting video title:', error);
      });
  };

  document.head.appendChild(vimeoScriptTag);
}

const vimeoIframeElements = document.querySelectorAll('iframe[src*="vimeo"]');

vimeoIframeElements.forEach((vimeoIframeElement) => {
  trackVimeoVideo(vimeoIframeElement);
});

function trackContactClicks(element, position) {
  let clickText = element.innerText;
  let clickUrl = element.href?.includes('?')
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

  addDataLayerEvent({
    event: 'contact_click',
    click_text: clickText,
    click_url: clickUrl,
    position,
  });
}

const headerContactPopElements = document.querySelectorAll(
  `[data-tracking-element="contact-us-link"]`,
);

headerContactPopElements.forEach((headerContactPopElement) => {
  headerContactPopElement.addEventListener('click', () => {
    trackContactClicks(headerContactPopElement, 'header');
  });
});

const headerContactElement = document.querySelector(
  `[data-tracking-element="contact-us-trigger"]`,
);

headerContactElement?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'contact_click',
    click_text: headerContactElement.innerText,
    position: 'header',
  });
});

// DND section, cannot add or target data attributes
const footerContactElements = document.querySelectorAll(
  'div.footer-main a[href^="tel"]',
);

footerContactElements.forEach((footerContactElement) => {
  footerContactElement.addEventListener('click', () => {
    trackContactClicks(footerContactElement, 'footer');
  });
});

const bottomFloatBar = document.querySelector(
  `[data-tracking-element="bottom-float-bar"] a`,
);

bottomFloatBar?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'contact_click',
    click_text: 'admission number',
    position: 'footer',
  });
});

const promo = document.querySelector('.deal-bar-btn');

promo?.addEventListener('click', () => {
  addDataLayerEvent({
    event: 'promotion_click',
    click_text: promo.parentElement.children[0].innerText,
    promo_code:
      promo.parentElement
        ?.querySelector('[data-promo-code]')
        ?.getAttribute('data-promo-code') || 'NA',
  });
});

function viewForm(element) {
  const formName =
    element.querySelector('input[name="leadsource"]').getAttribute('value') ||
    '';
  addDataLayerEvent({
    event: 'form_view',
    form_name: formName,
  });
}
function handleIntersection(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const form = entry.target.closest('form');
      const hiddenInput = form.querySelector('input[name="leadsource"]');
      if (hiddenInput && form.dataset.tracked !== 'true') {
        viewForm(form);
        observer.unobserve(form);
        form.dataset.tracked = 'true';
      }
    }
  });
}

// eslint-disable-next-line compat/compat
const observer = new IntersectionObserver(handleIntersection, {
  root: null,
  rootMargin: '50px',
  threshold: 0.5,
});

function iframeSubmitFormListener(form) {
  if (form.dataset.listenerAttached === 'true') return;
  form.addEventListener(
    'hsvalidatedsubmit',
    () => {
      const referUrl = window.location.href || '';
      const formName =
        form.querySelector('input[name="leadsource"]').getAttribute('value') ||
        '';
      const firstName =
        form.querySelector('input[id^="firstname"]')?.value || '';
      const email = form.querySelector('input[id^="email"]')?.value || '';
      addDataLayerEvent({
        event: 'form_submit_DL',
        form_name: formName,
        form_referrer_url: referUrl,
        first_name: firstName,
        email,
      });
    },
    { once: true },
  );
  form.dataset.listenerAttached = 'true';
}

const debouncedCheckForms = IIN.helpers.debounce(() => {
  const newForms = document.querySelectorAll('form');
  newForms.forEach((form) => {
    const hiddenInput = form.querySelector('input[name="leadsource"]');
    if (hiddenInput && form.dataset.tracked !== 'true') {
      observer.observe(form);
    }
  });
  const iframe = document.querySelector('iframe[src*="hs-web-interactive"]');
  try {
    const iframeForms = iframe?.contentDocument?.querySelectorAll('form') || [];
    iframeForms.forEach((form) => {
      const hiddenInput = form.querySelector('input[name="leadsource"]');
      if (hiddenInput && form.dataset.tracked !== 'true') {
        observer.observe(form);
        iframeSubmitFormListener(form);
      }
    });
  } catch (error) {
    console.warn('No iframes found', error);
  }
});

const mutationObserver = new MutationObserver(debouncedCheckForms);
mutationObserver.observe(document.body, { childList: true, subtree: true });

function initiateForm(element) {
  const formName =
    element.querySelector('input[name="leadsource"]').getAttribute('value') ||
    '';
  addDataLayerEvent({
    event: 'form_initiate',
    form_name: formName,
  });
}

function falloutForm(form, fieldName) {
  const formName =
    form.querySelector('input[name="leadsource"]').getAttribute('value') || '';
  addDataLayerEvent({
    event: 'form_fallout',
    form_name: formName,
    form_field_name: fieldName,
  });
}

function handleFormLastField(event) {
  const form = event.target.closest('form');
  const [lastField] = event.target.id.split('-');
  form.dataset.lastField = lastField;
  const formName = form
    .querySelector('input[name="leadsource"]')
    .getAttribute('value');
  const submitButton = form.querySelector('input[type="submit"]');
  let isSubmitting = false;
  let isTabSwitched = false;
  if (submitButton) {
    submitButton.addEventListener('click', () => {
      isSubmitting = true;
    });
  }

  document.addEventListener('visibilitychange', () => {
    isTabSwitched = document.hidden;
  });

  // This delay require to ensure that the flags like isTabSwitched and isSubmitting are updated accurately before fallout check occurs.
  setTimeout(() => {
    if (
      form.dataset.startTracked &&
      form.dataset.lastField &&
      !isTabSwitched &&
      !isSubmitting &&
      !formName.includes('Help Me Choose')
    ) {
      falloutForm(form, form.dataset.lastField);
    }
  }, 500);
}

function handleFormInitiate(event) {
  const form = event.target.closest('form');
  const hiddenInput = form.querySelector('input[name="leadsource"]');
  if (hiddenInput && form.dataset.startTracked !== 'true') {
    initiateForm(form);
    event.target.removeEventListener('focus', handleFormInitiate);
    form.dataset.startTracked = 'true';
  }
}

function addFormInitiateListener(form) {
  const inputs = form.querySelectorAll('input');
  const hiddenInput = form.querySelector('input[name="leadsource"]');
  if (hiddenInput) {
    inputs.forEach((input) => {
      input.addEventListener('focus', handleFormInitiate);
      input.addEventListener('focusout', handleFormLastField);
    });
  }
}

const debouncedAddListeners = IIN.helpers.debounce(() => {
  const newForms = document.querySelectorAll('form');
  newForms.forEach((form) => {
    if (!form.dataset.startTracked) {
      addFormInitiateListener(form);
    }
  });
  const iframe = document.querySelector('iframe[src*="hs-web-interactive"]');
  try {
    const iframeForms = iframe?.contentDocument?.querySelectorAll('form') || [];
    iframeForms.forEach((form) => {
      if (!form.dataset.startTracked) {
        addFormInitiateListener(form);
      }
    });
  } catch (error) {
    console.warn('No iframes found', error);
  }
});

const listenerMutationObserver = new MutationObserver(debouncedAddListeners);
listenerMutationObserver.observe(document.body, {
  childList: true,
  subtree: true,
});

const formCache = {};
function cacheFormData(
  dataFormId,
  firstName,
  lastName,
  email,
  country,
  phone,
  city,
  region,
  streetAddress,
  postalCode,
) {
  const selector = `form[data-form-id="${dataFormId}"]`;
  const hsForm = document.querySelector(selector);
  if (hsForm) {
    const formName =
      hsForm.querySelector('input[name="leadsource"]').getAttribute('value') ||
      '';
    formCache[dataFormId] = {
      formName,
      firstName,
      lastName,
      email,
      country,
      phone,
      city,
      region,
      streetAddress,
      postalCode,
    };
  } else {
    console.error('Form not found for data-form-id:', dataFormId);
  }
}

document.addEventListener(
  'input',
  (event) => {
    if (event.target.closest('form')) {
      const form = event.target.closest('form');
      const dataFormId = form.getAttribute('data-form-id');
      const firstName =
        form.querySelector('input[id^="firstname"]')?.value || '';
      const lastName = form.querySelector('input[id^="lastname"]')?.value || '';
      const email = form.querySelector('input[id^="email"]')?.value || '';
      const country =
        form.querySelector('select[id^="phone"]')?.value ||
        form.querySelector('select[id^="country"]')?.value;
      const phone =
        form.querySelector('input[id^="phone"]')?.value.replace(/\s+/g, '') ||
        '';
      const city = form.querySelector('input[id^="city"]')?.value || '';
      const region =
        form.querySelector('select[id*="state"]')?.value ||
        form.querySelector('select[id*="province"]')?.value ||
        '';
      const streetAddress =
        form.querySelector('input[id^="address"]')?.value || '';
      const postalCode = form.querySelector('input[id^="zip"]')?.value || '';
      cacheFormData(
        dataFormId,
        firstName,
        lastName,
        email,
        country,
        phone,
        city,
        region,
        streetAddress,
        postalCode,
      );
    }
  },
  true,
);

function submitForm(dataFormId, referUrl) {
  const cachedData = formCache[dataFormId];
  if (cachedData) {
    addDataLayerEvent({
      event: 'form_submit_DL',
      form_name: cachedData.formName,
      form_referrer_url: referUrl,
      first_name: cachedData.firstName,
      last_name: cachedData.lastName,
      email: cachedData.email,
      country: cachedData.country,
      phone: cachedData.phone,
      city: cachedData.city,
      region: cachedData.region,
      street_address: cachedData.streetAddress,
      postal_code: cachedData.postalCode,
    });
    delete formCache[dataFormId];
  } else {
    console.error('No cached data found for form:', dataFormId);
  }
}

window.addEventListener('message', (event) => {
  if (
    event.data.type === 'hsFormCallback' &&
    event.data.eventName === 'onFormSubmitted'
  ) {
    const dataFormId = event.data.id;
    const formReferrerUrl = window.location.href;
    submitForm(dataFormId, formReferrerUrl);
  }
});

function trackButtonInIframes() {
  const iframeCTA = document?.querySelector(
    'iframe[src*="hs-web-interactive"]',
  );
  iframeCTA?.addEventListener('load', () => {
    try {
      const checkButtonInterval = setInterval(() => {
        const button = iframeCTA?.contentDocument?.querySelector(
          '.interactive-button',
        );
        if (button) {
          if (!button.hasAttribute('data-tracking-attached')) {
            button.addEventListener('click', () => {
              addDataLayerEvent({
                event: 'cta_click',
                click_text: button.innerText,
                click_url: button.href.split('?')[0] || 'NA',
                position: 'NA',
                cta_track_id: 'NA',
              });
            });
            button.setAttribute('data-tracking-attached', 'true');
          }
          clearInterval(checkButtonInterval);
        }
      }, 500);
    } catch (error) {
      console.error('Error accessing iframe content:', error);
    }
  });
}
window.addEventListener('load', trackButtonInIframes);

const iframeObserver = new MutationObserver(trackButtonInIframes);
iframeObserver.observe(document.body, { childList: true, subtree: true });

const triggerECommEvent = async (rawPayload = {}) => {
  if (rawPayload && rawPayload.event) {
    addDataLayerEvent({ ecommerce: null }); // As per GTM need-resetting
    addDataLayerEvent(rawPayload);
  }
};

const getCustomItemId = (itemId, variantId) =>
  `shopify_US_${itemId}_${variantId}`;
