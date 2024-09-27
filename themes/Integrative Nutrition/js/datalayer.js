window.dataLayer = window.dataLayer || [];

function trackAccordionClick(element) {
  window.dataLayer.push({
    event: 'accordion_click',
    click_text: element.firstChild.innerText,
    action: element.classList.contains('active') ? 'close' : 'open',
  });

  element.classList.toggle('active');
}

function trackBioView(element) {
  window.dataLayer.push({
    event: 'accordion_click',
    click_text: element.innerText,
    action: 'open',
  });
}

function trackBioClose(element) {
  window.dataLayer.push({
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

  window.dataLayer.push({
    event: 'social_share',
    blog_title: blogTitle,
    share_type: shareType,
  });
}

function trackOpenChat() {
  window.dataLayer.push({
    event: 'chat_click',
    chat_action: 'open',
  });
}

function trackCloseChat() {
  window.dataLayer.push({
    event: 'chat_click',
    chat_action: 'close',
  });
}

function initializeEvents() {
  const accordions = document.querySelectorAll('div.ex-label');

  accordions.forEach((link) => {
    link.addEventListener('click', () => {
      trackAccordionClick(link);
    });
  });

  const viewBioButtons = document.querySelectorAll(
    '.bio-label .bio-closed strong',
  );

  viewBioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      trackBioView(button);
    });
  });

  const closeBioButtons = document.querySelectorAll(
    '.bio-label .bio-open strong',
  );

  closeBioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      trackBioClose(button);
    });
  });

  const socialShareLogos = document.querySelectorAll('.jd-post-share a');

  socialShareLogos.forEach((logo) => {
    logo.addEventListener('click', () => {
      trackSocialShare(logo);
    });
  });

  const openChatButton = document.querySelector('div#chatbtn');

  openChatButton?.addEventListener('click', trackOpenChat);

  const inviteDiv = document.querySelector('div#inviteBody');

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
const headerNavMenuElements = document.querySelectorAll('a.jd-nav-item-title');

headerNavMenuElements.forEach((element) => {
  element.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'header_nav_click',
      click_text: element.innerText,
      // Sending 0 in case no navigation, only opening sub menu
      click_url: '0',
    });
  });
});

// Navigation Logo tracking
const navLogoElement = document.querySelector(
  'div.jd-header-main.jd-mobile-hide a img',
);

navLogoElement?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'header_nav_click',
    click_text: 'logo',
    click_url: navLogoElement.parentElement.href,
  });
});

// Navigation Top Container tracking
const topBarNavigationElements = document.querySelectorAll(
  'div.jd-header-wrap div.jd-header-top.jd-mobile-hide ul li a',
);

topBarNavigationElements.forEach((element) => {
  element.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'header_nav_click',
      click_text:
        element.parentElement.id === 'jd-cart' ? 'cart' : element.innerText,
      click_url:
        element.href === `${window.location.href}#` ? '0' : element.href,
    });
  });
});

// Navigation CTA tracking
const navCTAElement = document.querySelector(
  'div.jd-header-main.jd-mobile-hide a[data-tracking-id]',
);

navCTAElement?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'header_nav_click',
    click_text: navCTAElement.innerText,
    click_url: navCTAElement.href,
  });
});

// Sub Navigation Events tracking
const subNavigationLinkElements = document.querySelectorAll('.jd-dd a');

subNavigationLinkElements.forEach((element) => {
  element.addEventListener('click', () => {
    window.dataLayer.push({
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

  window.dataLayer.push({
    event: eventName,
    click_text: clickText,
    click_url: clickUrl,
  });

  if (
    isFooterNavLink &&
    (clickUrl === 'https://iin.secure.force.com/AS' ||
      clickUrl === 'https://info.integrativenutrition.com/contact-us')
  ) {
    window.dataLayer.push({
      event: 'cta_click',
      click_text: clickText,
      click_url: clickUrl,
      position: 'footer',
    });
  }
}

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
    window.dataLayer.push({
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
  window.dataLayer.push({
    event: 'tab_click',
    click_text: element.innerText,
  });
}

const homePageTabElements = document.querySelectorAll('a.tab-item-link');

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

const bundleProductDetailPageTabElements = document.querySelectorAll('div.tab');

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
  '.jd-mobile-show div.jd-ham',
);

openHamburgerMenuElement?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'hamburger_click',
    action: 'open',
  });
});

const closeHamburgerMenuElement = document.querySelector(
  '#jd-mobile-menu div.jd-ham',
);

closeHamburgerMenuElement?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'hamburger_click',
    action: 'close',
  });
});

// Breadcrumbs Click Event tracking
const breadCrumbsElements = document.querySelectorAll('div.jd-blog-nav a');

breadCrumbsElements.forEach((element) => {
  element.addEventListener('click', () => {
    window.dataLayer.push({
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

  window.dataLayer.push({
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

const getFilterSelector = (name) =>
  `#course-pop-${name} input[name="${name}"]:checked`;

function getSelectedFilters() {
  const selectedTopics = [
    ...document.querySelectorAll(getFilterSelector('Topics')),
  ].map(({ value }) => value);

  const selectedLevels = [
    ...document.querySelectorAll(getFilterSelector('Levels')),
  ].map(({ value }) => value);

  const selectedTypes = [
    ...document.querySelectorAll(getFilterSelector('Type')),
  ].map(({ value }) => value);

  return { selectedTopics, selectedLevels, selectedTypes };
}

function trackFilterEvent() {
  const { selectedTopics, selectedLevels, selectedTypes } =
    getSelectedFilters();

  window.dataLayer.push({
    event: 'filter',
    filter_topics: selectedTopics,
    filter_levels: selectedLevels,
    filter_type: selectedTypes,
  });
}

const saveButtonElement = document.getElementById('course-filter-save');

saveButtonElement?.addEventListener('click', trackFilterEvent);

function trackSearchResults(element) {
  const articleCount = document.querySelectorAll('.jd-listing-item').length;

  window.dataLayer.push({
    event: 'search_results',
    search_term: element.value,
    search_result_count: articleCount,
  });
}

function trackViewSearchResults(element) {
  const articles = document.querySelectorAll(
    'article.jd-listing-item div.jd-listing-content h3',
  );

  const titles = [...articles].map(({ innerText }) => innerText);

  window.dataLayer.push({
    event: 'view_search_results',
    search_term: element.value,
    result_title: titles,
  });
}

const searchBoxElement = document.querySelector('#jd-blog-search-input');

searchBoxElement?.addEventListener('keydown', (event) => {
  if (event.key !== 'Enter') {
    return;
  }

  // Grace period for search results to process.
  setTimeout(() => {
    trackSearchResults(searchBoxElement);
    trackViewSearchResults(searchBoxElement);
  }, 5000);
});

const linkElements = document.querySelectorAll('a');

linkElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackFooterNavigationAndLinkClicks(element, 'link_click');
  });
});

function trackRegisterWebinar(element) {
  const headerText = element.getAttribute('data-tracking-header-label');
  const clickText = element.querySelector('div.content a')?.innerText;

  window.dataLayer.push({
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
          window.dataLayer.push({
            event: 'video_start',
            video_title: videoTitle,
          });
        });

        player.on('ended', () => {
          window.dataLayer.push({
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
              window.dataLayer.push({
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

headerContactElement?.addEventListener('click', () => {
  trackContactClicks(headerContactElement, 'header');
});

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

const promo = document.querySelector('.deal-bar-btn');

promo?.addEventListener('click', () => {
  window.dataLayer.push({
    event: 'promotion_click',
    click_text: promo.parentElement.children[0].innerText,
    promo_code:
      promo.parentElement
        ?.querySelector('[data-promo-code]')
        ?.getAttribute('data-promo-code') || 'NA',
  });
});
