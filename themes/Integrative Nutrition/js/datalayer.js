window.dataLayer = window.dataLayer || [];

function trackAccordionClick(element) {
  let action = 'open';
  if (element.classList.contains('active')) {
    action = 'close';
  }
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.firstChild.innerText,
    'action': action
  });
  element.classList.toggle('active');
}

function trackBioView(element) {
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.innerText,
    'action': 'open'
  });
}

function trackBioClose(element) {
  window.dataLayer.push({
    'event': 'accordion_click',
    'click_text': element.innerText,
    'action': 'close'
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
    'event': 'social_share',
    'blog_title': blogTitle,
    'share_type': shareType
  });
}

function trackOpenChat() {
  window.dataLayer.push({
    'event': 'chat_click',
    'chat_action': 'open'
  });
}
function trackCloseChat() {
  window.dataLayer.push({
    'event': 'chat_click',
    'chat_action': 'close'
  });
}

function initializeEvents() {

  const accordions = document.querySelectorAll('div.ex-label');
  accordions.forEach((link) => {
    link.addEventListener('click', () => {
      trackAccordionClick(link);
    });
  });


  const viewBioButtons = document.querySelectorAll('.bio-label .bio-closed strong');
  viewBioButtons.forEach((button) => {
    button.addEventListener('click', () => {
      trackBioView(button);
    });
  });


  const closeBioButtons = document.querySelectorAll('.bio-label .bio-open strong');
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
