window.dataLayer = window.dataLayer || [];

function trackAccordionClick(element) {
  let action = 'open';
  if (element.classList.contains('active')) {
    action = 'close';
  }
  window.dataLayer.push({
    event: 'accordion_click',
    click_text: element.firstChild.innerText,
    action,
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
  if (openChatButton) {
    openChatButton.addEventListener('click', () => {
      trackOpenChat();
    });
  }

  const inviteDiv = document.querySelector('div#inviteBody');
  if (inviteDiv?.children.length > 3) {
    const closeChatBtn = inviteDiv.children[3];
    if (closeChatBtn) {
      closeChatBtn.addEventListener('click', () => {
        trackCloseChat();
      });
    }
  }
}

window.addEventListener('load', () => {
  initializeEvents();
});

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
      click_url: '0', // Sending 0 in case no navigation, only opening sub menu
    });
  });
});

// Navigation Logo tracking
const navLogoElement = document.querySelector(
  'div.jd-header-main.jd-mobile-hide a img',
);
if (navLogoElement) {
  navLogoElement.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'header_nav_click',
      click_text: 'logo',
      click_url: navLogoElement.parentElement.href,
    });
  });
}

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
if (navCTAElement) {
  navCTAElement.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'header_nav_click',
      click_text: navCTAElement.innerText,
      click_url: navCTAElement.href,
    });
  });
}

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

// Footer Events tracking
function trackFooterNavigationClick(element) {
  let clickText = element.innerText;
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
  } else if (element.href === 'tel:877-730-5444') {
    clickText = 'us number';
    clickUrl = 'us number';
  } else if (element.href === 'tel:1-513-776-0960') {
    clickText = 'international number';
    clickUrl = 'international number';
  }

  window.dataLayer.push({
    event: 'footer_click',
    click_text: clickText,
    click_url: clickUrl,
  });

  if (
    clickUrl === 'https://iin.secure.force.com/AS' ||
    clickUrl === 'https://info.integrativenutrition.com/contact-us'
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
    trackFooterNavigationClick(element);
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
if (openHamburgerMenuElement) {
  openHamburgerMenuElement.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'hamburger_click',
      action: 'open',
    });
  });
}

const closeHamburgerMenuElement = document.querySelector(
  '#jd-mobile-menu div.jd-ham',
);
if (closeHamburgerMenuElement) {
  closeHamburgerMenuElement.addEventListener('click', () => {
    window.dataLayer.push({
      event: 'hamburger_click',
      action: 'close',
    });
  });
}

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
  });
}

const allGenericCTAElements = document.querySelectorAll('[data-tracking-id]');
allGenericCTAElements.forEach((element) => {
  element.addEventListener('click', () => {
    trackGenericCTAClick(element);
  });
});
